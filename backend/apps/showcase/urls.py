from rest_framework.routers import DefaultRouter

from .views import PartnerViewSet, ReelViewSet

router = DefaultRouter()
router.register(r"reels", ReelViewSet, basename="reel")
router.register(r"partners", PartnerViewSet, basename="partner")

urlpatterns = router.urls
