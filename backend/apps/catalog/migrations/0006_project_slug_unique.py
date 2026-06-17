from django.db import migrations, models


class Migration(migrations.Migration):
    """Lock in the slug: now that 0005 has filled every row with a unique value,
    make the column NOT NULL + UNIQUE (matching the final model field)."""

    dependencies = [
        ("catalog", "0005_populate_project_slug"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="slug",
            field=models.SlugField(
                blank=True,
                help_text="Стабильный id для маршрута кейса; пусто → авто из названия",
                max_length=140,
                unique=True,
            ),
        ),
    ]
