"""Root URL configuration: API routes + Swagger/ReDoc + admin + media."""
from django.conf import settings
from django.contrib import admin
from django.http import Http404
from django.urls import include, path, re_path
from django.views.static import serve as static_serve
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login with a dedicated, tight rate limit to blunt credential brute force.

    The default anon throttle (60/min) is shared across every public read, so it
    barely constrains a focused password-guessing run. This caps login attempts
    on their own scope (see DEFAULT_THROTTLE_RATES['login'])."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


#: Private upload prefixes (PII / client files) never served at a public /media/
#: path — released only through their signed-URL endpoints (LeadResumeView,
#: LeadAttachmentView). Public site assets (logos, project covers, news covers)
#: stay reachable.
PRIVATE_MEDIA_PREFIXES = ("resumes/", "attachments/")


def protected_media_serve(request, path):
    """Serve uploaded media, but never private files (resumes, brief ТЗ).

    Logos / project covers / news covers are public site content and must stay
    reachable. Private files are released only through their signed-URL
    endpoints, never at a guessable /media/ path.
    """
    normalized = path.replace("\\", "/")
    if normalized.startswith(PRIVATE_MEDIA_PREFIXES):
        raise Http404
    return static_serve(request, path, document_root=settings.MEDIA_ROOT)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.catalog.urls")),
    path("api/", include("apps.leads.urls")),
    path("api/", include("apps.news.urls")),
    path("api/", include("apps.showcase.urls")),
    # JWT auth (admin panel)
    path("api/auth/login/", ThrottledTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Uploaded media (logos public; resumes blocked here — see above).
    re_path(r"^media/(?P<path>.*)$", protected_media_serve),
]

# API docs expose the full surface; keep them to local development only.
if settings.DEBUG:
    schema_view = get_schema_view(
        openapi.Info(
            title="Webrand API",
            default_version="v1",
            description="Public read API for vacancies & projects + lead intake.",
        ),
        public=True,
        permission_classes=[permissions.AllowAny],
    )
    urlpatterns += [
        path(
            "swagger/",
            schema_view.with_ui("swagger", cache_timeout=0),
            name="schema-swagger-ui",
        ),
        path(
            "redoc/",
            schema_view.with_ui("redoc", cache_timeout=0),
            name="schema-redoc",
        ),
    ]
