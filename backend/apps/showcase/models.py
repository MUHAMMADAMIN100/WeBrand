from django.db import models


class Reel(models.Model):
    """A YouTube reel/short featured on the /smm showcase page.

    ``youtube_url`` accepts any YouTube link shape (watch?v=, youtu.be/,
    /shorts/, /embed/…) — the frontend extracts the video id for embedding.
    Manual ordering via ``sort_order`` (drag-and-drop in the admin), same as
    vacancies/projects/news.
    """

    youtube_url = models.URLField(
        max_length=500,
        help_text="Ссылка на YouTube в любом формате (watch?v=…, youtu.be/…, /shorts/…)",
    )
    title = models.CharField(max_length=160, blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Рилс"
        verbose_name_plural = "Рилсы"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title or self.youtube_url


class Partner(models.Model):
    """A strong SMM partner card shown on the /smm showcase page.

    ``logo`` is public site content (same posture as project logos: default
    public storage, served as an absolute URL). ``result`` is free-form text —
    a short result or description line, no auto-generated metrics.
    """

    name = models.CharField(max_length=120)
    logo = models.ImageField(upload_to="partners/", null=True, blank=True)
    niche = models.CharField(max_length=120, blank=True, default="")
    description = models.TextField(
        blank=True,
        default="",
        help_text="Основной текст «о компании» — показывается в модалке на сайте",
    )
    result = models.TextField(
        blank=True,
        default="",
        help_text="Короткая строка результата или описания (произвольный текст)",
    )
    link = models.URLField(null=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Партнёр"
        verbose_name_plural = "Партнёры"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.name
