from rest_framework import serializers

from .models import Partner, Reel


class ReelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reel
        fields = [
            "id",
            "youtube_url",
            "title",
            "sort_order",
        ]


class PartnerSerializer(serializers.ModelSerializer):
    # Writable on input (multipart file upload); rewritten to an absolute URL
    # on output via to_representation below — mirrors ProjectSerializer.
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Partner
        fields = [
            "id",
            "name",
            "logo",
            "niche",
            "description",
            "result",
            "link",
            "sort_order",
        ]

    def to_representation(self, instance):
        """Serialize logo back as an absolute URL so the frontend gets a ready link."""
        rep = super().to_representation(instance)
        if instance.logo:
            request = self.context.get("request")
            url = instance.logo.url
            rep["logo"] = request.build_absolute_uri(url) if request else url
        else:
            rep["logo"] = None
        return rep
