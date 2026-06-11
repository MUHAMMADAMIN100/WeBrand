"""Seed the 50 service-focused RU articles for the SEO blog.

Idempotent: ``update_or_create`` on the stable ``slug``; re-running refreshes
content without duplicates. ``--prune`` additionally deletes articles whose
slug is not in the current seed set (used when replacing an old content set).

Covers: every article gets a category cover from ``_covers/`` (tasteful brand
geometry, no logo); articles with ``brand=True`` (WeBrand-centric: cases,
"why a local agency") get the WeBrand logo cover instead. A cover is attached
only when the article has none, so a custom cover uploaded in the admin is
never overwritten by a re-seed.

Content lives in ``_articles_a.py`` (web+SEO), ``_articles_b.py`` (SMM+design),
``_articles_b2.py`` (design supplement) and ``_articles_c.py``
(animation+AI+local) as plain ``ARTICLES`` lists.

Usage: python manage.py seed_news [--prune]
"""
from datetime import timedelta
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.news.models import News

from ._articles_a import ARTICLES as ARTICLES_A
from ._articles_b import ARTICLES as ARTICLES_B
from ._articles_b2 import ARTICLES as ARTICLES_B2
from ._articles_c import ARTICLES as ARTICLES_C

_ALL = ARTICLES_A + ARTICLES_B + ARTICLES_B2 + ARTICLES_C


def _interleave(articles):
    """Round-robin across categories so the date-ordered feed alternates
    topics (and covers) instead of running each category in a block."""
    groups = {}
    for a in articles:
        groups.setdefault(a["category"], []).append(a)
    queues = list(groups.values())
    mixed = []
    while queues:
        for q in list(queues):
            mixed.append(q.pop(0))
            if not q:
                queues.remove(q)
    return mixed


# Feed order (newest-first): interleaved categories; published_at derives from
# the index below.
ARTICLES = _interleave(_ALL)

COVERS_DIR = Path(__file__).parent / "_covers"

# category -> cover file (no logo); brand-centric articles get webrand.png.
CATEGORY_COVERS = {
    "web": "web.png",
    "seo": "seo.png",
    "smm": "smm.png",
    "design": "design.png",
    "animation": "animation.png",
    "ai": "ai.png",
    "local": "local.png",
}


class Command(BaseCommand):
    help = "Seed the 50 service-focused news articles (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--prune",
            action="store_true",
            help="Delete articles whose slug is not in the seed set.",
        )

    def handle(self, *args, **options):
        now = timezone.now()
        created = updated = covers = 0

        for index, data in enumerate(ARTICLES):
            # Newest first; ~3-day steps with an hour jitter so dates differ.
            published_at = now - timedelta(days=index * 3, hours=(index * 7) % 24)
            obj, was_created = News.objects.update_or_create(
                slug=data["slug"],
                defaults={
                    "title": data["title"],
                    "excerpt": data["excerpt"],
                    "body": data["body"],
                    "meta_title": data.get("meta_title", ""),
                    "meta_description": data.get("meta_description", ""),
                    "keywords": data.get("keywords", []),
                    "is_published": True,
                    "published_at": published_at,
                    "sort_order": 0,
                },
            )
            created += int(was_created)
            updated += int(not was_created)

            # Attach a cover only when the article has none (admin uploads win).
            if not obj.cover:
                name = (
                    "webrand.png"
                    if data.get("brand")
                    else CATEGORY_COVERS.get(data.get("category", ""))
                )
                src = COVERS_DIR / name if name else None
                if src and src.exists():
                    with src.open("rb") as fh:
                        obj.cover.save(f"cover-{data['slug']}.png", File(fh), save=True)
                    covers += 1
                else:
                    self.stdout.write(self.style.WARNING(f"Cover not found: {name}"))

        pruned = 0
        if options["prune"]:
            keep = {a["slug"] for a in ARTICLES}
            stale = News.objects.exclude(slug__in=keep)
            for obj in stale:
                if obj.cover:
                    obj.cover.delete(save=False)  # remove the orphaned media file
                obj.delete()
                pruned += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"News seed complete: {created} created, {updated} updated, "
                f"{covers} covers attached, {pruned} pruned, "
                f"{News.objects.count()} total."
            )
        )
