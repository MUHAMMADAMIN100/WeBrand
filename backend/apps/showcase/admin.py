from django.contrib import admin
from django.utils.html import format_html

from .models import Partner, Reel


@admin.register(Reel)
class ReelAdmin(admin.ModelAdmin):
    list_display = ("__str__", "youtube_url", "sort_order", "created_at")
    list_editable = ("sort_order",)
    search_fields = ("title", "youtube_url")
    ordering = ("sort_order", "id")
    readonly_fields = ("created_at",)


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ("name", "logo_preview", "niche", "link", "sort_order", "created_at")
    list_editable = ("sort_order",)
    list_filter = ("niche",)
    search_fields = ("name", "niche", "result")
    ordering = ("sort_order", "id")
    readonly_fields = ("logo_preview", "created_at")

    @admin.display(description="Логотип")
    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:6px;" />',
                obj.logo.url,
            )
        return "—"
