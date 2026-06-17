import re
from pathlib import Path

from rest_framework import serializers

from apps.catalog.models import Vacancy
from apps.choices import AGE_MAX, AGE_MIN, EXPERIENCE_VALUES

from .models import Lead

# First char a letter, then letters / spaces / apostrophes / hyphens.
# Python re has no \p{L}; [^\W\d_] matches any unicode letter.
NAME_RE = re.compile(r"^[^\W\d_](?:[^\W\d_]|[\s'’-])*$", re.UNICODE)
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
TELEGRAM_RE = re.compile(r"^@?[A-Za-z0-9_]{5,32}$")

KIND_VALUES = {"lead", "application"}
# Quiz direction ids — must mirror DIRECTIONS in frontend ContactForm.tsx.
KNOWN_SELECTED = {"smm", "design", "dev", "ads", "unsure"}
MAX_ANSWER_LEN = 500

PDF_CONTENT_TYPES = ("application/pdf", "application/x-pdf")
MAX_RESUME_BYTES = 10 * 1024 * 1024  # ~10 MB

# Brief attachment (ТЗ) — broader than resumes (docs/sheets/archives/images).
ATTACHMENT_EXTS = {
    ".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt", ".md",
    ".xls", ".xlsx", ".csv", ".ppt", ".pptx",
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic",
    ".zip", ".rar", ".7z",
}
MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024  # ~20 MB


class LeadListSerializer(serializers.ModelSerializer):
    """Read-only projection for the admin journal (GET /api/leads/journal/)."""

    kind_display = serializers.CharField(source="get_kind_display", read_only=True)
    resume = serializers.SerializerMethodField()
    attachment = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            "id",
            "kind",
            "kind_display",
            "role",
            "name",
            "contact",
            "phone",
            "company_name",
            "message",
            "experience",
            "age",
            "resume",
            "attachment",
            "selected",
            "answers",
            "is_sent_to_telegram",
            "created_at",
        ]

    def get_resume(self, obj):
        """Signature-protected resume URL (not the public /media/ path)."""
        if not obj.resume:
            return None
        from .resume_access import signed_resume_url

        return signed_resume_url(self.context.get("request"), obj)

    def get_attachment(self, obj):
        """Signature-protected brief-attachment URL (not the public /media/ path)."""
        if not obj.attachment:
            return None
        from .resume_access import signed_attachment_url

        return signed_attachment_url(self.context.get("request"), obj)


class LeadSerializer(serializers.ModelSerializer):
    # Honeypot: not a model field. Bots fill it; humans never see it. This is the
    # ONLY `company`; the visible brief field is the separate `company_name`.
    company = serializers.CharField(required=False, allow_blank=True, write_only=True)
    resume = serializers.FileField(required=False, allow_null=True)
    attachment = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Lead
        fields = [
            "kind",
            "role",
            "name",
            "contact",
            "phone",
            "company_name",
            "message",
            "experience",
            "age",
            "resume",
            "attachment",
            "selected",
            "answers",
            "company",
        ]
        extra_kwargs = {
            "company_name": {"required": False, "allow_blank": True},
            "message": {"required": False, "allow_blank": True},
            "experience": {"required": False, "allow_blank": True},
            "age": {"required": False, "allow_null": True},
        }

    # --- field-level validation --------------------------------------------
    def validate_kind(self, value):
        if value not in KIND_VALUES:
            raise serializers.ValidationError("kind должен быть lead или application.")
        return value

    def validate_name(self, value):
        value = (value or "").strip()
        if not (2 <= len(value) <= 50):
            raise serializers.ValidationError("Имя должно быть от 2 до 50 символов.")
        if not NAME_RE.match(value):
            raise serializers.ValidationError("Имя содержит недопустимые символы.")
        return value

    def validate_contact(self, value):
        value = (value or "").strip()
        if EMAIL_RE.match(value) or TELEGRAM_RE.match(value):
            return value
        raise serializers.ValidationError(
            "Контакт должен быть email или telegram-ник (@username)."
        )

    def validate_phone(self, value):
        digits = re.sub(r"\D", "", value or "")
        # Drop a leading country code 992.
        if digits.startswith("992"):
            digits = digits[3:]
        if len(digits) != 9:
            raise serializers.ValidationError(
                "Телефон должен содержать 9 цифр (без кода +992)."
            )
        return f"+992{digits}"

    def validate_company_name(self, value):
        return (value or "").strip()

    def validate_message(self, value):
        value = (value or "").strip()
        if len(value) > 2000:
            raise serializers.ValidationError("Сообщение слишком длинное (макс. 2000).")
        return value

    def validate_attachment(self, value):
        if not value:
            return value
        ext = Path((getattr(value, "name", "") or "").lower()).suffix
        if ext not in ATTACHMENT_EXTS:
            raise serializers.ValidationError("Недопустимый тип файла ТЗ.")
        if value.size > MAX_ATTACHMENT_BYTES:
            raise serializers.ValidationError("Файл ТЗ слишком большой (макс. 20 МБ).")
        return value

    def validate_experience(self, value):
        value = (value or "").strip()
        if value and value not in EXPERIENCE_VALUES:
            raise serializers.ValidationError("Недопустимое значение опыта.")
        return value

    def validate_age(self, value):
        if value is None:
            return value
        if not (AGE_MIN <= value <= AGE_MAX):
            raise serializers.ValidationError(
                f"Возраст должен быть от {AGE_MIN} до {AGE_MAX}."
            )
        return value

    def validate_resume(self, value):
        if not value:
            return value
        name = (getattr(value, "name", "") or "").lower()
        content_type = (getattr(value, "content_type", "") or "").lower()
        if not name.endswith(".pdf") or content_type not in PDF_CONTENT_TYPES:
            raise serializers.ValidationError("Резюме должно быть файлом PDF.")
        if value.size > MAX_RESUME_BYTES:
            raise serializers.ValidationError("Файл резюме слишком большой (макс. 10 МБ).")
        # Magic-byte sanity check — a real PDF starts with "%PDF-".
        try:
            head = value.read(5)
            value.seek(0)
            if not head.startswith(b"%PDF-"):
                raise serializers.ValidationError("Файл не является корректным PDF.")
        except (AttributeError, OSError):
            pass
        return value

    def validate_selected(self, value):
        if not isinstance(value, list) or not value:
            raise serializers.ValidationError("selected должен быть непустым списком.")
        unknown = [s for s in value if s not in KNOWN_SELECTED]
        if unknown:
            raise serializers.ValidationError(f"Неизвестные направления: {unknown}.")
        return value

    def validate_answers(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("answers должен быть объектом.")
        for v in value.values():
            items = v if isinstance(v, list) else [v]
            for item in items:
                if isinstance(item, str) and len(item) > MAX_ANSWER_LEN:
                    raise serializers.ValidationError("Слишком длинный ответ.")
        return value

    # --- object-level validation -------------------------------------------
    def validate(self, attrs):
        # Honeypot is handled in the view (silent 200) — don't fail here.
        if attrs.get("company"):
            return attrs

        # answers keys must be a subset of selected.
        selected = set(attrs.get("selected", []))
        answers = attrs.get("answers", {})
        extra = set(answers.keys()) - selected
        if extra:
            raise serializers.ValidationError(
                {"answers": f"Ключи не входят в selected: {sorted(extra)}."}
            )

        # application requires an existing vacancy slug.
        if attrs.get("kind") == "application":
            role = attrs.get("role")
            if not role:
                raise serializers.ValidationError(
                    {"role": "role обязателен для отклика на вакансию."}
                )
            if not Vacancy.objects.filter(slug=role).exists():
                raise serializers.ValidationError(
                    {"role": f"Вакансия '{role}' не найдена."}
                )
            # A resume (PDF) is always required to apply.
            if not attrs.get("resume"):
                raise serializers.ValidationError(
                    {"resume": "Для отклика необходимо приложить резюме (PDF)."}
                )
        return attrs

    def create(self, validated_data):
        validated_data.pop("company", None)
        return Lead.objects.create(**validated_data)
