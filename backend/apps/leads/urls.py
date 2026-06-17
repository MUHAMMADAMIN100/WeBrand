from django.urls import path

from .views import (
    LeadAttachmentView,
    LeadCreateView,
    LeadDetailView,
    LeadJournalView,
    LeadResumeView,
)

urlpatterns = [
    path("leads/", LeadCreateView.as_view(), name="lead-create"),
    path("leads/journal/", LeadJournalView.as_view(), name="lead-journal"),
    path("leads/journal/<int:pk>/", LeadDetailView.as_view(), name="lead-detail"),
    path(
        "leads/journal/<int:pk>/resume/",
        LeadResumeView.as_view(),
        name="lead-resume",
    ),
    path(
        "leads/journal/<int:pk>/attachment/",
        LeadAttachmentView.as_view(),
        name="lead-attachment",
    ),
]
