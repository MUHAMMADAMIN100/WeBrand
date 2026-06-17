from django.db import migrations
from django.utils.text import slugify


def populate_slugs(apps, schema_editor):
    """Give every existing project a unique slug derived from its name.

    Runs before the unique constraint is added (0006), so duplicates are
    de-duplicated here with ``-2``, ``-3``… suffixes. Empty/ASCII-less names
    fall back to ``project-<pk>``.
    """
    Project = apps.get_model("catalog", "Project")
    used = set()
    for p in Project.objects.all().order_by("id"):
        base = (slugify(p.name, allow_unicode=False) or f"project-{p.pk}")[:140]
        slug = base
        i = 2
        while slug in used:
            suffix = f"-{i}"
            slug = base[: 140 - len(suffix)] + suffix
            i += 1
        used.add(slug)
        p.slug = slug
        p.save(update_fields=["slug"])


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0004_project_case_description_project_cover_and_more"),
    ]

    operations = [
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
    ]
