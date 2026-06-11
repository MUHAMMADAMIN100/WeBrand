from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from apps.catalog.views import ReadOnlyOrAdmin

from .models import News
from .serializers import NewsDetailSerializer, NewsListSerializer


class NewsPagination(PageNumberPagination):
    """Paginate the news feed. Only applied to the News endpoint — the catalog
    endpoints stay un-paginated (their frontends consume plain arrays)."""

    page_size = 9
    page_size_query_param = "page_size"
    max_page_size = 1000


class NewsViewSet(viewsets.ModelViewSet):
    """Public read; admin-only write — same posture as the catalog.

    Anonymous visitors see only published articles; staff (admin panel) see
    drafts too. Accepts multipart so the cover can be uploaded as a file.
    Lookup is by ``slug`` (the model PK).
    """

    lookup_field = "slug"
    permission_classes = [ReadOnlyOrAdmin]
    pagination_class = NewsPagination
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_serializer_class(self):
        # Light shape for the list feed; full body + SEO for single-article ops.
        return NewsListSerializer if self.action == "list" else NewsDetailSerializer

    def get_queryset(self):
        qs = News.objects.all()
        user = self.request.user
        if not (user and user.is_staff):
            qs = qs.filter(is_published=True)
        return qs
