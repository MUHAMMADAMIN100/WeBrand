from django.contrib import admin
from django.utils.html import format_html

from .models import Project, Vacancy


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "icon", "accent", "sort_order", "is_published")
    list_editable = ("sort_order", "is_published")
    list_filter = ("is_published", "accent", "icon")
    search_fields = ("title", "slug", "tagline")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("sort_order", "id")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "category",
        "logo_preview",
        "cover_preview",
        "site_url",
        "sort_order",
        "is_published",
        "is_featured",
    )
    list_editable = ("sort_order", "is_published", "is_featured")
    list_filter = ("category", "is_published", "is_featured")
    search_fields = ("name", "slug", "subtitle", "description", "case_description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "id")
    readonly_fields = ("logo_preview", "cover_preview", "created_at", "updated_at")

    @admin.display(description="Логотип")
    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:6px;" />',
                obj.logo.url,
            )
        return "—"

    @admin.display(description="Обложка")
    def cover_preview(self, obj):
        if obj.cover:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:6px;" />',
                obj.cover.url,
            )
        return "—"
