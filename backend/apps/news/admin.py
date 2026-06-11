from django.contrib import admin
from django.utils.html import format_html

from .models import News


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "cover_preview", "is_published", "published_at", "sort_order")
    list_editable = ("is_published", "sort_order")
    list_filter = ("is_published",)
    search_fields = ("title", "slug", "excerpt", "body")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("sort_order", "-published_at")
    readonly_fields = ("cover_preview", "created_at", "updated_at")
    date_hierarchy = "published_at"

    @admin.display(description="Обложка")
    def cover_preview(self, obj):
        if obj.cover:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:6px;" />',
                obj.cover.url,
            )
        return "—"
