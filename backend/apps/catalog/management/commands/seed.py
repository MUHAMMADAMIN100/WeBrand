"""Seed the 6 vacancies + 14 projects from the frontend content.ts.

Idempotent (get_or_create on the stable key). Logos are copied from
frontend/public/logos/ into MEDIA_ROOT/logos/ and attached to projects.
BARF (id 4) and iram.cinema (id 14) have no logo file → logo stays null;
iram keeps its manual initials "IC".

Usage: python manage.py seed
"""
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from apps.catalog.models import Project, Vacancy

# frontend/public/logos relative to repo root (backend/ is a sibling of frontend/)
LOGOS_SRC = settings.BASE_DIR.parent / "frontend" / "public" / "logos"

VACANCIES = [
    {
        "slug": "designer",
        "title": "Дизайнер",
        "tagline": "Создаёшь визуал брендов: от логотипа и айдентики до интерфейсов сайтов и приложений.",
        "type": "Полная занятость · Душанбе",
        "tags": ["Графдизайн", "UI/UX", "Figma"],
        "icon": "Palette",
        "accent": "brand-600",
    },
    {
        "slug": "smm",
        "title": "SMM-специалист",
        "tagline": "Ведёшь соцсети клиентов: контент-план, тексты, съёмки и вовлечение аудитории.",
        "type": "Полная занятость · Гибрид",
        "tags": ["Instagram", "Контент", "Stories"],
        "icon": "Megaphone",
        "accent": "brand-500",
    },
    {
        "slug": "sales",
        "title": "Менеджер по продажам",
        "tagline": "Общаешься с клиентами, ведёшь сделки и помогаешь бизнесу выбрать решение.",
        "type": "Полная занятость · Офис",
        "tags": ["Переговоры", "CRM", "B2B"],
        "icon": "Handshake",
        "accent": "brand-700",
    },
    {
        "slug": "frontend",
        "title": "Frontend-разработчик",
        "tagline": "Верстаешь и оживляешь современные адаптивные сайты на React и Tailwind.",
        "type": "Полная занятость · Удалённо",
        "tags": ["React", "TypeScript", "Tailwind"],
        "icon": "Code2",
        "accent": "brand-600",
    },
    {
        "slug": "targetolog",
        "title": "Таргетолог",
        "tagline": "Настраиваешь рекламу в Instagram и Facebook и приносишь клиентам заявки, а не сливы бюджета.",
        "type": "Проектная занятость · Удалённо",
        "tags": ["Meta Ads", "Аналитика", "Бюджеты"],
        "icon": "Target",
        "accent": "brand-500",
    },
    {
        "slug": "content",
        "title": "Контент-мейкер",
        "tagline": "Снимаешь и монтируешь Reels и ролики, которые набирают охваты и продают.",
        "type": "Гибкий график · Душанбе",
        "tags": ["Reels", "Съёмка", "Монтаж"],
        "icon": "Clapperboard",
        "accent": "brand-700",
    },
]

# Order matches the content.ts array → sort_order = index.
PROJECTS = [
    {
        "legacy_id": 1,
        "name": "Khotiri Jam",
        "subtitle": "центр детской терапии",
        "description": "Корпоративный сайт медицинского центра с акцентом на доверие, команду специалистов и онлайн-запись.",
        "category": "Разработка",
        "tags": ["Website", "Healthcare", "UX"],
        "accent": "#14B8A6",
        "logo": "khotiri-jam.png",
        "url": "https://www.khotirijam.tj/",
    },
    {
        "legacy_id": 2,
        "name": "SABT Business",
        "subtitle": "онлайн-запись для бизнеса",
        "description": "SaaS-платформа для записи клиентов, управления расписанием и автоматических напоминаний.",
        "category": "Разработка",
        "tags": ["SaaS", "CRM", "Booking"],
        "accent": "#8B5CF6",
        "logo": "sabt.png",
        "url": "https://sabt.tj/",
    },
    {
        "legacy_id": 3,
        "name": "Todo",
        "subtitle": "маркетплейс еды и продуктов",
        "description": "Платформа для подключения магазинов, увеличения продаж и узнаваемости брендов.",
        "category": "Разработка",
        "tags": ["Marketplace", "E-commerce", "Web App"],
        "accent": "#EC4899",
        "logo": "todo.webp",
        "url": "https://todo.tj/",
    },
    {
        "legacy_id": 4,
        "name": "BARF",
        "subtitle": "корпоративные подарки",
        "description": "Создание интернет-магазина для новогодних корпоративных подарков с акцентом на премиальность.",
        "category": "Разработка",
        "tags": ["Landing", "Brand", "E-commerce"],
        "accent": "#DC2626",
        "logo": None,
        "url": "https://www.barf.tj/",
    },
    {
        "legacy_id": 5,
        "name": "GetUp",
        "subtitle": "интернет-магазин автозапчастей",
        "description": "Каталог автозапчастей с фильтрами по маркам и быстрой системой заказов.",
        "category": "Разработка",
        "tags": ["E-commerce", "Catalog", "Platform"],
        "accent": "#F59E0B",
        "logo": "getup.jpg",
        "url": "https://getup.tj/",
    },
    {
        "legacy_id": 14,
        "name": "iram.cinema",
        "subtitle": "кинотеатр в Душанбе",
        "description": "Сайт для самого большого и атмосферного кинотеатра Душанбе: расписание сеансов, онлайн-бронирование билетов и закрытая зона для подписчиков.",
        "category": "Разработка",
        "tags": ["Website", "Cinema", "Booking"],
        "accent": "#F97316",
        "logo": None,
        "initials": "IC",
        "url": "https://www.iramcinema.tj/",
    },
    {
        "legacy_id": 13,
        "name": "Grant China",
        "subtitle": "образование в Китае без посредников",
        "description": "Сайт для поступления в топ-университеты Китая: языковые курсы, колледж, бакалавриат и магистратура. Полное сопровождение от выбора программы до зачисления.",
        "category": "Разработка",
        "tags": ["Website", "Education", "Lead-gen"],
        "accent": "#DC2626",
        "logo": "grantchina.webp",
        "url": "https://www.grantchina.tj/",
    },
    {
        "legacy_id": 6,
        "name": "SHAKL",
        "subtitle": "дизайн интерьеров",
        "description": "SMM и визуал для бренда интерьеров: позиционирование и привлечение премиум-аудитории.",
        "category": "SMM",
        "tags": ["Instagram", "Visual", "Brand"],
        "accent": "#9C2228",
        "logo": "shakl.png",
        "url": "https://www.instagram.com/shakl.tj/",
    },
    {
        "legacy_id": 7,
        "name": "Loftory",
        "subtitle": "мебель и столы в стиле Loft",
        "description": "Сайт-каталог мебели и столов из металла и ЛДСП. Индивидуальный заказ, рассрочка и доставка по Душанбе.",
        "category": "Разработка",
        "tags": ["Website", "Catalog", "Furniture"],
        "accent": "#1F2937",
        "logo": "loftory.webp",
        "url": "https://www.loftory.tj/",
    },
    {
        "legacy_id": 8,
        "name": "Armut Cafe",
        "subtitle": "турецкая кухня",
        "description": "Продвижение ресторана: контент, вовлечённость и формирование лояльной аудитории.",
        "category": "SMM",
        "tags": ["Restaurant", "Instagram", "Engagement"],
        "accent": "#1D4ED8",
        "logo": "armut.png",
        "url": "https://www.instagram.com/armut.cafe/",
    },
    {
        "legacy_id": 9,
        "name": "BARF",
        "subtitle": "подарочные боксы",
        "description": "SMM и визуал для корпоративных и персональных подарков.",
        "category": "SMM",
        "tags": ["Instagram", "Sales", "Brand"],
        "accent": "#7C1D1D",
        "logo": "barf.webp",
        "url": "https://www.instagram.com/barf.dushanbe/",
    },
    {
        "legacy_id": 10,
        "name": "SABT",
        "subtitle": "онлайн-запись",
        "description": "Контент и объяснение продукта для сервиса онлайн-записи и автоматизации.",
        "category": "SMM",
        "tags": ["SaaS", "Instagram", "Education"],
        "accent": "#5B21B6",
        "logo": "sabt.png",
        "url": "https://www.instagram.com/sabt.online.tj/",
    },
    {
        "legacy_id": 11,
        "name": "Sapporo",
        "subtitle": "доставка японской кухни",
        "description": "Продвижение доставки еды: визуал, акции и постоянная коммуникация.",
        "category": "SMM",
        "tags": ["Food", "Delivery", "Instagram"],
        "accent": "#991B1B",
        "logo": "sapporo.webp",
        "url": "https://www.instagram.com/sapporo_dushanbe/",
    },
    {
        "legacy_id": 12,
        "name": "ASAN",
        "subtitle": "клиника офтальмологии",
        "description": "Контент для медицинской клиники: доверие, экспертиза и услуги.",
        "category": "SMM",
        "tags": ["Healthcare", "Instagram", "Trust"],
        "accent": "#047857",
        "logo": "asan.webp",
        "url": "https://www.instagram.com/asan_dushanbe/",
    },
]


class Command(BaseCommand):
    help = "Seed vacancies and projects from the frontend content.ts."

    def handle(self, *args, **options):
        self._seed_vacancies()
        self._seed_projects()
        self.stdout.write(self.style.SUCCESS("Seed complete."))

    def _seed_vacancies(self):
        created = 0
        for index, data in enumerate(VACANCIES):
            obj, was_created = Vacancy.objects.get_or_create(
                slug=data["slug"],
                defaults={
                    "title": data["title"],
                    "tagline": data["tagline"],
                    "type": data["type"],
                    "tags": data["tags"],
                    "icon": data["icon"],
                    "accent": data["accent"],
                    "sort_order": index,
                    "is_published": True,
                },
            )
            created += int(was_created)
        self.stdout.write(
            f"Vacancies: {created} created, {Vacancy.objects.count()} total."
        )

    def _seed_projects(self):
        created = 0
        attached = 0
        for index, data in enumerate(PROJECTS):
            obj, was_created = Project.objects.get_or_create(
                legacy_id=data["legacy_id"],
                name=data["name"],
                category=data["category"],
                defaults={
                    "subtitle": data["subtitle"],
                    "description": data["description"],
                    "tags": data["tags"],
                    "accent": data["accent"],
                    "url": data.get("url"),
                    "initials": data.get("initials"),
                    "sort_order": index,
                    "is_published": True,
                },
            )
            created += int(was_created)

            logo_name = data.get("logo")
            if logo_name and not obj.logo:
                src = LOGOS_SRC / logo_name
                if src.exists():
                    with src.open("rb") as fh:
                        obj.logo.save(logo_name, File(fh), save=True)
                    attached += 1
                else:
                    self.stdout.write(
                        self.style.WARNING(f"Logo not found: {src}")
                    )
        self.stdout.write(
            f"Projects: {created} created, {Project.objects.count()} total, "
            f"{attached} logos attached this run."
        )
