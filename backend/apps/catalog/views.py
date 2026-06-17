from rest_framework import viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Project, Vacancy
from .serializers import ProjectSerializer, VacancySerializer


class ReadOnlyOrAdmin(BasePermission):
    """Public reads (GET/HEAD/OPTIONS); writes require a staff/superuser.

    Pairs with JWTAuthentication: only a token for an is_staff user may
    create/update/delete. Anonymous and non-staff get 401/403 on writes.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class VacancyViewSet(viewsets.ModelViewSet):
    """Public read; admin-only write.

    Single source of truth for vacancy order: the queryset is ordered by
    ``sort_order`` (then ``slug`` for stable tie-breaks). Admin (drag-and-drop
    reorder, which PATCHes ``sort_order``) and the public site consume this same
    order — neither frontend re-sorts.
    """

    serializer_class = VacancySerializer
    lookup_field = "slug"
    permission_classes = [ReadOnlyOrAdmin]

    def get_queryset(self):
        qs = Vacancy.objects.all().order_by("sort_order", "slug")
        # Anonymous/public visitors only ever see published vacancies; staff
        # (admin panel) see everything so they can manage drafts.
        user = self.request.user
        if not (user and user.is_staff):
            qs = qs.filter(is_published=True)
        return qs


class ProjectViewSet(viewsets.ModelViewSet):
    """Public read; admin-only write. Filterable by ?category= and ?featured=.

    Accepts multipart uploads so the logo can be sent as a file on
    create/update; JSON bodies (no file) still work too.

    ``?featured=true`` narrows to the top-cases set (``is_featured``); combine
    with ``?category=SMM`` for the /smm page's «Топ-кейсы» block.
    """

    serializer_class = ProjectSerializer
    permission_classes = [ReadOnlyOrAdmin]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Project.objects.all().order_by("sort_order", "id")
        user = self.request.user
        if not (user and user.is_staff):
            qs = qs.filter(is_published=True)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        # Lets the public case page fetch a single project by its stable slug
        # (e.g. /api/projects/?slug=shakl) without changing the id-based lookup
        # the admin panel uses for CRUD.
        slug = self.request.query_params.get("slug")
        if slug:
            qs = qs.filter(slug=slug)
        featured = self.request.query_params.get("featured")
        if featured is not None:
            if featured.lower() in ("1", "true", "yes"):
                qs = qs.filter(is_featured=True)
            elif featured.lower() in ("0", "false", "no"):
                qs = qs.filter(is_featured=False)
        return qs
