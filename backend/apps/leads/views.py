import logging
import mimetypes
from pathlib import Path

from django.core import signing
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveDestroyAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import Lead
from .resume_access import (
    signed_resume_url,
    verify_attachment_token,
    verify_resume_token,
)
from .serializers import LeadListSerializer, LeadSerializer
from .telegram import send_lead_to_telegram

logger = logging.getLogger(__name__)


class LeadResumeView(APIView):
    """GET /api/leads/journal/<pk>/resume/?token=… — gated resume download.

    Public route, but the file is only released for a valid, unexpired signature
    bound to this exact lead pk. Those signatures are minted solely by the
    admin-only journal endpoints, so possession of a working link already implies
    a prior authenticated staff request. This keeps the admin panel's plain
    <a href> download working (no Bearer header on the GET) without exposing
    resumes at a public, guessable /media/ path.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, pk):
        token = request.query_params.get("token", "")
        try:
            signed_pk = verify_resume_token(token)
        except signing.BadSignature:
            raise Http404
        if str(signed_pk) != str(pk):
            raise Http404
        lead = get_object_or_404(Lead, pk=pk)
        if not lead.resume:
            raise Http404
        return FileResponse(
            lead.resume.open("rb"),
            content_type="application/pdf",
            as_attachment=True,
            filename=f"resume-{lead.pk}.pdf",
        )


class LeadAttachmentView(APIView):
    """GET /api/leads/journal/<pk>/attachment/?token=… — gated ТЗ download.

    Same signed-token model as LeadResumeView, with its own salt so a resume
    token can't be replayed here. Brief attachments are private (never served at
    a public /media/ path); only the admin-only journal mints working links.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, pk):
        token = request.query_params.get("token", "")
        try:
            signed_pk = verify_attachment_token(token)
        except signing.BadSignature:
            raise Http404
        if str(signed_pk) != str(pk):
            raise Http404
        lead = get_object_or_404(Lead, pk=pk)
        if not lead.attachment:
            raise Http404
        ext = Path(lead.attachment.name).suffix or ".bin"
        content_type = mimetypes.guess_type(lead.attachment.name)[0] or "application/octet-stream"
        return FileResponse(
            lead.attachment.open("rb"),
            content_type=content_type,
            as_attachment=True,
            filename=f"attachment-{lead.pk}{ext}",
        )


class LeadsThrottle(AnonRateThrottle):
    scope = "leads"


def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class LeadCreateView(CreateAPIView):
    """POST /api/leads/ — public lead intake. Honeypot + throttle + Telegram."""

    serializer_class = LeadSerializer
    permission_classes = [AllowAny]
    throttle_classes = [LeadsThrottle]
    # Accept JSON (contact-form leads) AND multipart (applications with a resume
    # file). The honeypot is read from validated_data, so it works for both.
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Honeypot: a filled 'company' field means a bot. Silently accept,
        # but do NOT save or notify.
        if serializer.validated_data.get("company"):
            logger.info("Honeypot tripped from %s — silently dropped.", _client_ip(request))
            return Response({"ok": True}, status=status.HTTP_200_OK)

        lead = serializer.save(ip=_client_ip(request))

        resume_url = signed_resume_url(request, lead)
        sent = send_lead_to_telegram(lead, resume_url=resume_url)
        if sent and not lead.is_sent_to_telegram:
            lead.is_sent_to_telegram = True
            lead.save(update_fields=["is_sent_to_telegram"])

        return Response({"ok": True, "id": lead.id}, status=status.HTTP_201_CREATED)


class LeadJournalView(ListAPIView):
    """GET /api/leads/journal/ — admin-only read journal of all leads.

    Additive read endpoint for the admin panel; does not change the public
    POST intake above. Protected by IsAdminUser (JWT/session staff only).
    """

    serializer_class = LeadListSerializer
    permission_classes = [IsAdminUser]
    queryset = Lead.objects.all().order_by("-created_at")


class LeadDetailView(RetrieveDestroyAPIView):
    """GET/DELETE /api/leads/journal/<pk>/ — admin-only single lead.

    GET reuses the journal serializer (resume as an absolute URL). DELETE removes
    the lead and best-effort deletes its resume file. Public POST intake and the
    list journal are untouched. Protected by IsAdminUser (JWT/session staff).
    """

    serializer_class = LeadListSerializer
    permission_classes = [IsAdminUser]
    queryset = Lead.objects.all()

    def perform_destroy(self, instance):
        # Best-effort: drop the private files from storage, but never let a
        # storage hiccup block the row deletion itself.
        for field in ("resume", "attachment"):
            f = getattr(instance, field)
            if f:
                try:
                    f.delete(save=False)
                except Exception:
                    logger.warning(
                        "Failed to delete %s file for lead %s", field, instance.pk, exc_info=True
                    )
        instance.delete()
