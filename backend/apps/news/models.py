from django.db import models
from django.utils import timezone


class News(models.Model):
    """A news/blog article, primarily for SEO.

    PK is the ``slug`` (mirrors the catalog Vacancy convention) so the public
    article URL ``/news/<slug>`` is stable and the API looks the article up by
    the same key. ``body`` holds HTML rendered on the article page; the SEO
    fields feed per-page <title>/meta/JSON-LD on the public site.
    """

    slug = models.SlugField(
        primary_key=True,
        max_length=80,
        help_text="Стабильный id в URL: /news/<slug>",
    )
    title = models.CharField(max_length=160)
    excerpt = models.CharField(
        max_length=300,
        help_text="Короткое описание для карточки и превью (1–2 предложения).",
    )
    body = models.TextField(help_text="Текст статьи (HTML).")
    cover = models.ImageField(
        upload_to="news/",
        null=True,
        blank=True,
        help_text="Обложка (опц.). Публичное хранилище, как у логотипов.",
    )
    # --- SEO ---------------------------------------------------------------
    meta_title = models.CharField(
        max_length=70,
        blank=True,
        default="",
        help_text="SEO <title> (пусто → берётся title).",
    )
    meta_description = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="SEO meta description (пусто → берётся excerpt).",
    )
    keywords = models.JSONField(
        default=list,
        blank=True,
        help_text="Ключевые слова (список) для meta keywords.",
    )
    # --- Publication -------------------------------------------------------
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(
        default=timezone.now,
        help_text="Дата публикации (используется для сортировки ленты).",
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Ручная сортировка (меньше — выше). При равенстве — новее выше.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Новость"
        verbose_name_plural = "Новости"
        # sort_order first (manual pin), then newest published first.
        ordering = ["sort_order", "-published_at", "-created_at"]

    def __str__(self):
        return f"{self.title} ({self.slug})"
