from rest_framework import serializers

from .models import Project, Vacancy


class VacancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacancy
        fields = [
            "slug",
            "title",
            "tagline",
            "type",
            "tags",
            "icon",
            "accent",
            "sort_order",
            "is_published",
            "experience_required",
            "age_min",
            "age_max",
            "resume_required",
        ]


class ProjectSerializer(serializers.ModelSerializer):
    # Writable on input (multipart file upload); rewritten to absolute URLs on
    # output via to_representation below.
    logo = serializers.ImageField(required=False, allow_null=True)
    cover = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "legacy_id",
            "slug",
            "name",
            "subtitle",
            "description",
            "case_description",
            "category",
            "tags",
            "accent",
            "logo",
            "cover",
            "url",
            "site_url",
            "initials",
            "sort_order",
            "is_published",
            "is_featured",
        ]
        # slug is derived from the name (auto-filled on save) and is the stable
        # case-route id — read-only so links can't be silently broken via the API.
        read_only_fields = ["slug"]

    def to_representation(self, instance):
        """Serialize image fields back as absolute URLs so the frontend gets ready links."""
        rep = super().to_representation(instance)
        request = self.context.get("request")
        for field in ("logo", "cover"):
            file = getattr(instance, field)
            if file:
                url = file.url
                rep[field] = request.build_absolute_uri(url) if request else url
            else:
                rep[field] = None
        return rep
