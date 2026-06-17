import re
import uuid
from pathlib import Path

from django.core.files.storage import storages
from django.db import models

from apps.choices import EXPERIENCE_CHOICES

KIND_CHOICES = [
    ("lead", "Заявка с формы"),
    ("application", "Отклик на вакансию"),
]


def brief_upload_path(instance, filename):
    """Store brief attachments (ТЗ) under an unguessable random name.

    Same posture as resumes: a random stem in the private ``attachments/``
    prefix (direct /media/attachments/ is 404'd in config/urls.py; with S3 the
    'resumes' storage is querystring-signed). The only sanctioned download is the
    signed-token endpoint (LeadAttachmentView). The (sanitised) extension is kept
    so the file opens with the right app.
    """
    suffix = Path(filename or "").suffix.lower()
    if not re.fullmatch(r"\.[a-z0-9]{1,8}", suffix or ""):
        suffix = ""
    return f"attachments/{uuid.uuid4().hex}{suffix}"


def resume_upload_path(instance, filename):
    """Store resumes under an unguessable random name.

    The original filename is attacker-controlled and was previously kept
    verbatim, which made stored CVs enumerable/overwritable. We keep only the
    (validated) ``.pdf`` suffix and randomise the stem so files can't be guessed
    or collided. Access is additionally gated by a signed URL (see views.py).
    """
    suffix = Path(filename or "").suffix.lower()
    if suffix != ".pdf":
        suffix = ".pdf"
    return f"resumes/{uuid.uuid4().hex}{suffix}"


def select_resume_storage():
    """Resumes are PII: they live in the private 'resumes' storage alias.

    Locally that's the filesystem (direct /media/resumes/ is 404'd in
    config/urls.py); with S3 creds set it's a querystring-signed S3 storage,
    so the file never gets a plain public URL. Either way the only sanctioned
    download path is the signed-token streaming endpoint (LeadResumeView).
    """
    return storages["resumes"]


class Lead(models.Model):
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default="lead")
    role = models.CharField(
        max_length=60,
        null=True,
        blank=True,
        help_text="slug вакансии, если kind=application",
    )
    name = models.CharField(max_length=50)
    contact = models.CharField(max_length=60, help_text="email или @telegram")
    phone = models.CharField(max_length=20)
    # VISIBLE company name from the «Обсудить проект» brief — NOT the honeypot.
    # The honeypot stays the (non-model, write-only) `company` field on the
    # serializer; this is a real, saved value.
    company_name = models.CharField(
        max_length=120,
        blank=True,
        default="",
        help_text="Видимое название компании из формы брифа (не honeypot)",
    )
    message = models.TextField(
        blank=True, default="", help_text="Необязательное сообщение / текст брифа"
    )
    # --- Applicant fields (only kind=application uses them) ---
    experience = models.CharField(
        max_length=20, choices=EXPERIENCE_CHOICES, blank=True, default=""
    )
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    resume = models.FileField(
        upload_to=resume_upload_path,
        storage=select_resume_storage,
        null=True,
        blank=True,
    )
    # Brief attachment (ТЗ) — private storage, same as resumes.
    attachment = models.FileField(
        upload_to=brief_upload_path,
        storage=select_resume_storage,
        null=True,
        blank=True,
        help_text="Файл ТЗ из формы брифа (приватное хранилище, как у резюме)",
    )
    selected = models.JSONField(default=list, blank=True)
    answers = models.JSONField(default=dict, blank=True)
    is_sent_to_telegram = models.BooleanField(default=False)
    ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_kind_display()}: {self.name} ({self.created_at:%Y-%m-%d %H:%M})"
