"""Seed a few DEMO projects to preview the portfolio redesign (mockup cards +
case pages) with real content in the new fields.

These are clearly-marked placeholders — every demo has a ``demo-`` slug prefix and
a "(демо)" name, so they are trivially isolated from the real 14 projects (whose
slugs never start with ``demo-``) and easy to remove.

Idempotent: re-running updates the same rows (matched by slug) and never
duplicates. Covers are generated locally as a plain brand-blue gradient with the
project name — they are NOT regenerated on re-run (so files don't pile up).

Usage:
    python manage.py seed_demo_projects          # add / refresh demo projects
    python manage.py seed_demo_projects --clear   # remove all demo projects + covers

Descriptions are neutral and descriptive (what the project is / what was done) —
no invented metrics or results presented as real cases.
"""
import io

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from apps.catalog.models import Project

DEMO_SLUG_PREFIX = "demo-"

DEMOS = [
    {
        "slug": "demo-corporate-site",
        "name": "Корпоративный сайт (демо)",
        "subtitle": "сайт компании",
        "description": "Демо-проект: многостраничный корпоративный сайт с разделами об услугах, команде и контактах.",
        "case_description": (
            "Демонстрационный проект для предпросмотра нового оформления портфолио. "
            "В работах такого типа мы проектируем структуру корпоративного сайта, "
            "готовим адаптивную вёрстку, собираем страницы услуг, «О компании» и "
            "контактов, подключаем форму заявки и базовую аналитику. Текст "
            "описательный и не содержит реальных показателей — это заглушка для "
            "демонстрации дизайна карточек и страницы кейса."
        ),
        "category": "Разработка",
        "accent": "#2B5ED3",
        "tags": ["Сайт", "Корпоративный", "Адаптив"],
        "is_featured": True,
    },
    {
        "slug": "demo-online-store",
        "name": "Интернет-магазин (демо)",
        "subtitle": "каталог и корзина",
        "description": "Демо-проект: интернет-магазин с каталогом, карточками товаров и корзиной.",
        "case_description": (
            "Демонстрационный проект. В таких работах мы собираем каталог с "
            "фильтрами, карточки товара, корзину и оформление заказа, настраиваем "
            "адаптивность и подключение к складу и оплате. Описание нейтральное и "
            "приведено только для предпросмотра редизайна."
        ),
        "category": "Разработка",
        "accent": "#224EB4",
        "tags": ["E-commerce", "Каталог", "Корзина"],
        "is_featured": False,
    },
    {
        "slug": "demo-smm-support",
        "name": "SMM-сопровождение (демо)",
        "subtitle": "ведение соцсетей",
        "description": "Демо-проект: контент-план и ведение аккаунтов бренда в социальных сетях.",
        "case_description": (
            "Демонстрационный проект для предпросмотра. В рамках SMM-сопровождения "
            "мы формируем контент-план, прорабатываем рубрики и визуальный стиль, "
            "готовим посты и сторис, ведём сообщество. Текст описательный, без "
            "реальных цифр — это заглушка для демонстрации страницы кейса."
        ),
        "category": "SMM",
        "accent": "#406FDB",
        "tags": ["SMM", "Контент", "Соцсети"],
        "is_featured": True,
    },
    {
        "slug": "demo-landing",
        "name": "Лендинг услуги (демо)",
        "subtitle": "одностраничный сайт",
        "description": "Демо-проект: продающий лендинг для одной услуги с формой заявки.",
        "case_description": (
            "Демонстрационный проект. Лендинг такого типа включает оффер, блоки "
            "преимуществ, описание услуги, отзывы и форму заявки; делаем адаптивную "
            "вёрстку и подключаем аналитику. Контент нейтральный и предназначен "
            "только для предпросмотра дизайна."
        ),
        "category": "Разработка",
        "accent": "#5D86E5",
        "tags": ["Лендинг", "Заявки", "Адаптив"],
        "is_featured": False,
    },
    {
        "slug": "demo-social-creatives",
        "name": "Креативы для соцсетей (демо)",
        "subtitle": "дизайн постов и сторис",
        "description": "Демо-проект: серия креативов для постов и сторис в едином стиле.",
        "case_description": (
            "Демонстрационный проект для предпросмотра. В работах такого формата мы "
            "готовим шаблоны постов и сторис, единую сетку и оформление, адаптируем "
            "под форматы площадок. Описание приведено как заглушка и не содержит "
            "реальных результатов."
        ),
        "category": "SMM",
        "accent": "#193D8F",
        "tags": ["Дизайн", "Креативы", "Сторис"],
        "is_featured": False,
    },
]

SITE_URL = "https://webrand.tj"


class Command(BaseCommand):
    help = "Seed (or --clear) demo projects that showcase the portfolio redesign."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all demo projects (slug starts with 'demo-') and their covers.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self._clear()
            return
        self._seed()

    # ------------------------------------------------------------------ clear
    def _clear(self):
        qs = Project.objects.filter(slug__startswith=DEMO_SLUG_PREFIX)
        n = qs.count()
        for p in qs:
            if p.cover:
                try:
                    p.cover.delete(save=False)
                except Exception:
                    pass
        qs.delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {n} demo project(s)."))

    # ------------------------------------------------------------------- seed
    def _seed(self):
        created = covers = 0
        for index, d in enumerate(DEMOS):
            obj, was_created = Project.objects.update_or_create(
                slug=d["slug"],
                defaults={
                    "name": d["name"],
                    "subtitle": d["subtitle"],
                    "description": d["description"],
                    "case_description": d["case_description"],
                    "category": d["category"],
                    "tags": d["tags"],
                    "accent": d["accent"],
                    "site_url": SITE_URL,
                    "is_featured": d["is_featured"],
                    "is_published": True,
                    "sort_order": index,
                },
            )
            created += int(was_created)

            # Generate the placeholder cover only when missing → idempotent, no
            # piling-up of files on re-run. Same storage as real project images.
            if not obj.cover:
                png = self._make_cover(d["name"], d["accent"])
                obj.cover.save(f"{d['slug']}.png", ContentFile(png), save=True)
                covers += 1

        total = Project.objects.filter(slug__startswith=DEMO_SLUG_PREFIX).count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Demo projects: {created} created, {total} total, "
                f"{covers} cover(s) generated this run."
            )
        )

    # --------------------------------------------------------------- cover gen
    def _make_cover(self, name: str, accent_hex: str) -> bytes:
        """A simple brand-blue gradient placeholder with the project name."""
        from PIL import Image, ImageDraw

        W, H = 1280, 800
        top = self._hex_rgb(accent_hex)
        bottom = (25, 61, 143)  # brand-800 #193D8F

        # Vertical gradient: build a 1×H strip, then stretch to full width.
        strip = Image.new("RGB", (1, H))
        for y in range(H):
            t = y / (H - 1)
            strip.putpixel(
                (0, y),
                (
                    round(top[0] + (bottom[0] - top[0]) * t),
                    round(top[1] + (bottom[1] - top[1]) * t),
                    round(top[2] + (bottom[2] - top[2]) * t),
                ),
            )
        img = strip.resize((W, H))
        draw = ImageDraw.Draw(img)

        # Demo marker (top-left) + faux URL (bottom) so it never looks "real".
        small = self._font(30)
        draw.text((64, 56), "WeBrand · демо", font=small, fill=(255, 255, 255))

        # Centered, word-wrapped project title.
        title_font = self._font(76)
        lines = self._wrap(draw, name, title_font, W - 200)
        heights = [self._line_h(draw, ln, title_font) for ln in lines]
        gap = 14
        total_h = sum(heights) + gap * (len(lines) - 1)
        y = (H - total_h) // 2
        for ln, h in zip(lines, heights):
            w = self._line_w(draw, ln, title_font)
            draw.text(((W - w) // 2, y), ln, font=title_font, fill=(255, 255, 255))
            y += h + gap

        draw.text((64, H - 70), SITE_URL.replace("https://", ""), font=small, fill=(230, 238, 255))

        buf = io.BytesIO()
        img.save(buf, "PNG")
        return buf.getvalue()

    @staticmethod
    def _hex_rgb(h: str):
        h = h.lstrip("#")
        return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))

    @staticmethod
    def _font(size: int):
        from PIL import ImageFont

        for path in (
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
        return ImageFont.load_default()

    @staticmethod
    def _line_w(draw, text, font):
        b = draw.textbbox((0, 0), text, font=font)
        return b[2] - b[0]

    @staticmethod
    def _line_h(draw, text, font):
        b = draw.textbbox((0, 0), text, font=font)
        return b[3] - b[1]

    def _wrap(self, draw, text, font, max_w):
        words = text.split()
        lines, cur = [], ""
        for w in words:
            test = (cur + " " + w).strip()
            if self._line_w(draw, test, font) <= max_w or not cur:
                cur = test
            else:
                lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines
