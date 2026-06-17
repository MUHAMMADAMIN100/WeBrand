from django.contrib import admin

from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """Read-only journal of incoming leads."""

    list_display = (
        "created_at",
        "kind",
        "name",
        "company_name",
        "contact",
        "phone",
        "role",
        "is_sent_to_telegram",
    )
    list_filter = ("kind", "is_sent_to_telegram", "created_at")
    search_fields = ("name", "company_name", "contact", "phone", "role")
    readonly_fields = (
        "kind",
        "role",
        "name",
        "company_name",
        "contact",
        "phone",
        "message",
        "experience",
        "age",
        "resume",
        "attachment",
        "selected",
        "answers",
        "is_sent_to_telegram",
        "ip",
        "created_at",
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
