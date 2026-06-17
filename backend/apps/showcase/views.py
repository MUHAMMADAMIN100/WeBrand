from rest_framework import viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from apps.catalog.views import ReadOnlyOrAdmin

from .models import Partner, Reel
from .serializers import PartnerSerializer, ReelSerializer


class ReelViewSet(viewsets.ModelViewSet):
    """Public read; admin-only write — same posture as the catalog.

    Single source of truth for reel order: the queryset is ordered by
    ``sort_order`` (then ``id``). The admin reorders via drag-and-drop (PATCH
    ``sort_order``) and the public /smm page consumes this order as-is.
    Un-paginated — the frontend consumes a plain array.
    """

    serializer_class = ReelSerializer
    permission_classes = [ReadOnlyOrAdmin]

    def get_queryset(self):
        return Reel.objects.all().order_by("sort_order", "id")


class PartnerViewSet(viewsets.ModelViewSet):
    """Public read; admin-only write — same posture as the catalog.

    Accepts multipart uploads so the logo can be sent as a file on
    create/update; JSON bodies (no file) still work too. Ordered by
    ``sort_order`` then ``id``; un-paginated (plain array for the frontend).
    """

    serializer_class = PartnerSerializer
    permission_classes = [ReadOnlyOrAdmin]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return Partner.objects.all().order_by("sort_order", "id")
