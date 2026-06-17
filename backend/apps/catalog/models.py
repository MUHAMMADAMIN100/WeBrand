from django.core.validators import RegexValidator
from django.db import models
from django.utils.text import slugify

from apps.choices import EXPERIENCE_CHOICES


def unique_project_slug(instance):
    """A URL-safe, unique slug derived from the project name.

    Falls back to ``project-<pk>`` (or just ``project``) when the name has no
    ASCII-sluggable characters, and appends ``-2``, ``-3``… on collisions.
    """
    base = slugify(instance.name, allow_unicode=False) or (
        f"project-{instance.pk}" if instance.pk else "project"
    )
    base = base[:140]
    Model = type(instance)
    slug = base
    i = 2
    while Model.objects.exclude(pk=instance.pk).filter(slug=slug).exists():
        suffix = f"-{i}"
        slug = base[: 140 - len(suffix)] + suffix
        i += 1
    return slug

# lucide-react icon names supported by the ICONS map in Careers.tsx.
# Anything outside this set falls back to Briefcase on the frontend.
ICON_CHOICES = [
    ("Palette", "Palette"),
    ("Megaphone", "Megaphone"),
    ("Handshake", "Handshake"),
    ("Code2", "Code2"),
    ("Target", "Target"),
    ("Clapperboard", "Clapperboard"),
]

# brand-scale tokens understood by the ACCENT_TEXT map on the frontend.
ACCENT_CHOICES = [
    ("brand-500", "brand-500"),
    ("brand-600", "brand-600"),
    ("brand-700", "brand-700"),
]

# Category is a contract with Portfolio.tsx (hard-coded filters) and
# admin-panel/src/lib/options.ts (CATEGORY_OPTIONS) — keep all three in sync.
CATEGORY_CHOICES = [
    ("Разработка", "Разработка"),
    ("SMM", "SMM"),
    ("Дизайн", "Дизайн"),
    ("Реклама", "Реклама"),
]

hex_color_validator = RegexValidator(
    regex=r"^#[0-9A-Fa-f]{6}$",
    message="Цвет должен быть в формате HEX, напр. #14B8A6",
)


class Vacancy(models.Model):
    slug = models.SlugField(
        unique=True,
        max_length=60,
        help_text="Стабильный id: designer, smm, frontend …",
    )
    title = models.CharField(max_length=120)
    tagline = models.CharField(max_length=255)
    type = models.CharField(
        max_length=120,
        help_text="Напр. «Полная занятость · Душанбе» (свободный текст)",
    )
    tags = models.JSONField(default=list, blank=True)
    icon = models.CharField(max_length=20, choices=ICON_CHOICES)
    accent = models.CharField(max_length=10, choices=ACCENT_CHOICES)
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    # --- Applicant requirements (all optional; shown to candidates) ---
    experience_required = models.CharField(
        max_length=20, choices=EXPERIENCE_CHOICES, blank=True, default=""
    )
    age_min = models.PositiveSmallIntegerField(null=True, blank=True)
    age_max = models.PositiveSmallIntegerField(null=True, blank=True)
    resume_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Вакансия"
        verbose_name_plural = "Вакансии"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.title} ({self.slug})"


class Project(models.Model):
    legacy_id = models.IntegerField(
        null=True, blank=True, help_text="Прежний числовой id из content.ts"
    )
    # Stable identifier for the public case-study route (/cases/<slug>). Auto-
    # generated from the name on first save; stays put on later renames so links
    # don't break. Numeric `id` still works for admin CRUD lookups.
    slug = models.SlugField(
        max_length=140,
        unique=True,
        blank=True,
        help_text="Стабильный id для маршрута кейса; пусто → авто из названия",
    )
    name = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=160)
    description = models.TextField(help_text="Короткое описание для карточки")
    case_description = models.TextField(
        blank=True,
        default="",
        help_text="Развёрнутое описание для страницы кейса",
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    tags = models.JSONField(default=list, blank=True)
    accent = models.CharField(
        max_length=7,
        validators=[hex_color_validator],
        help_text="HEX, напр. #14B8A6",
    )
    logo = models.ImageField(upload_to="logos/", null=True, blank=True)
    cover = models.ImageField(
        upload_to="projects/",
        null=True,
        blank=True,
        help_text="Скриншот для мокапа на карточке и в кейсе",
    )
    url = models.URLField(
        null=True, blank=True, help_text="Внешняя ссылка кейса; пусто → «Кейс скоро»"
    )
    site_url = models.URLField(
        blank=True, default="", help_text="Ссылка на живой сайт проекта"
    )
    initials = models.CharField(
        max_length=4,
        null=True,
        blank=True,
        help_text="Ручной fallback («IC»); пусто → берётся из name",
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    is_featured = models.BooleanField(
        default=False,
        help_text="Отметка «в топ» — попадает в подборку топ-кейсов на странице /smm",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Проект"
        verbose_name_plural = "Проекты"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.name} [{self.category}]"

    def save(self, *args, **kwargs):
        # Auto-fill the slug from the name when missing; never overwrite an
        # existing slug, so a rename keeps the case URL stable.
        if not self.slug:
            self.slug = unique_project_slug(self)
        super().save(*args, **kwargs)
