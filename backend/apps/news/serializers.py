from rest_framework import serializers

from .models import News


class _AbsoluteCoverMixin(serializers.ModelSerializer):
    """Serialize the cover ImageField back as an absolute URL (or null)."""

    cover = serializers.ImageField(required=False, allow_null=True)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.cover:
            request = self.context.get("request")
            url = instance.cover.url
            rep["cover"] = request.build_absolute_uri(url) if request else url
        else:
            rep["cover"] = None
        return rep


class NewsListSerializer(_AbsoluteCoverMixin):
    """Lightweight shape for feeds/sitemap — no heavy ``body``."""

    class Meta:
        model = News
        fields = [
            "slug",
            "title",
            "excerpt",
            "cover",
            "keywords",
            "is_published",
            "published_at",
            "sort_order",
        ]


class NewsDetailSerializer(_AbsoluteCoverMixin):
    """Full article incl. body + SEO fields (article page & admin edit)."""

    class Meta:
        model = News
        fields = [
            "slug",
            "title",
            "excerpt",
            "body",
            "cover",
            "meta_title",
            "meta_description",
            "keywords",
            "is_published",
            "published_at",
            "sort_order",
            "created_at",
            "updated_at",
        ]
