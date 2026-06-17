export const nav = [
  { label: "О компании", href: "#about" },
  { label: "Услуги", href: "#services" },
  { label: "Портфолио", href: "#portfolio" },
  { label: "Работы по SMM", href: "/smm" },
  { label: "Вакансии", href: "/vacancies" },
]

export const heroTags = [
  "Разработка сайтов",
  "Дизайн / Брендинг",
  "SMM",
  "SEO / Контекстная реклама",
  "Анимация",
]

export type SubService = {
  id: string
  title: string
  short: string
  description: string
  includes: string[]
  timeline: string
  bestFor: string
}

export type Service = {
  id: number
  number: string
  title: string
  description: string
  items: SubService[]
}

export const services: Service[] = [
  {
    id: 1,
    number: "01",
    title: "Разработка сайтов",
    description: "Разработка современных, адаптивных и функциональных сайтов для бизнеса.",
    items: [
      {
        id: "landing",
        title: "Лендинги",
        short: "Одностраничные сайты для продаж и привлечения клиентов",
        description: "Лендинг — это одностраничный продающий сайт, заточенный под одну конкретную цель: продать продукт, собрать заявки или зарегистрировать на событие. Высокая конверсия за счёт продуманной структуры и сильного оффера.",
        includes: [
          "Анализ ниши и конкурентов",
          "Сценарий и продающая структура",
          "Уникальный дизайн под бренд",
          "Адаптивная вёрстка (моб./план./десктоп)",
          "Подключение форм и CRM",
          "Подключение аналитики",
        ],
        timeline: "7–14 дней",
        bestFor: "Запуск нового продукта, продажа услуги, регистрация на ивент, рекламная кампания.",
      },
      {
        id: "corp",
        title: "Корпоративные сайты",
        short: "Многостраничные сайты для серьёзного бизнеса",
        description: "Корпоративный сайт формирует имидж компании, рассказывает о продуктах и услугах, привлекает клиентов и партнёров. Удобная структура, продуманный UX и админка для самостоятельного управления контентом.",
        includes: [
          "До 10 страниц (О нас, Услуги, Кейсы, Блог, Контакты)",
          "Уникальный дизайн и анимации",
          "Адаптивная вёрстка",
          "CMS-админка (если нужно)",
          "Интеграции (формы, чат, карты)",
          "SEO-оптимизация",
        ],
        timeline: "14–30 дней",
        bestFor: "Средний и крупный бизнес, B2B-компании, агентства, производственные компании.",
      },
      {
        id: "webapp",
        title: "Web-приложения",
        short: "Сложные платформы и SaaS-продукты",
        description: "Web-приложение — это интерактивный продукт с авторизацией, личным кабинетом, базой данных и сложной бизнес-логикой. Разрабатываем SaaS, CRM, маркетплейсы и кастомные платформы.",
        includes: [
          "Прототипирование и UX-исследование",
          "Авторизация и роли пользователей",
          "База данных и API",
          "Личный кабинет / админ-панель",
          "Интеграции с внешними сервисами",
          "Тестирование и деплой",
        ],
        timeline: "от 30 дней",
        bestFor: "Стартапы, SaaS-продукты, внутренние системы компании, маркетплейсы.",
      },
      {
        id: "ecommerce",
        title: "E-commerce",
        short: "Интернет-магазины с каталогом и оплатой",
        description: "Полноценный интернет-магазин: каталог товаров, корзина, оформление заказа, оплата онлайн и доставка. Удобная админка для управления товарами, заказами и клиентами.",
        includes: [
          "Каталог с фильтрами и поиском",
          "Корзина и оформление заказа",
          "Онлайн-оплата (карты, кошельки)",
          "Интеграция со службами доставки",
          "Админка для управления",
          "Личный кабинет покупателя",
        ],
        timeline: "21–45 дней",
        bestFor: "Розничные продавцы, бренды, производители, нишевые магазины.",
      },
    ],
  },
  {
    id: 2,
    number: "02",
    title: "Онлайн-эквайринг",
    description: "Подключение удобных и безопасных платежных решений для бизнеса.",
    items: [
      {
        id: "payments",
        title: "Приём платежей",
        short: "Подключение онлайн-оплаты на сайт",
        description: "Подключаем приём платежей на ваш сайт — оплата картами, мобильными кошельками и популярными платёжными системами Таджикистана.",
        includes: [
          "Подключение банка-эквайера",
          "Интеграция платёжной формы",
          "Поддержка карт Visa/Mastercard",
          "Подключение Алиф, Душанбе-сити, ESHATA",
          "Чеки и квитанции",
          "Уведомления о платежах",
        ],
        timeline: "5–10 дней",
        bestFor: "Интернет-магазины, сервисы по подписке, онлайн-курсы, услуги.",
      },
      {
        id: "subscriptions",
        title: "Подписки",
        short: "Рекуррентные платежи для SaaS и клубов",
        description: "Автоматические регулярные списания с карт клиентов. Идеально для SaaS-продуктов, онлайн-сервисов и клубных проектов.",
        includes: [
          "Сохранение карт",
          "Автосписания по расписанию",
          "Гибкие тарифные планы",
          "Уведомления о списаниях",
          "Управление подписками в личном кабинете",
          "Возвраты и отмены",
        ],
        timeline: "10–14 дней",
        bestFor: "SaaS-продукты, онлайн-школы, фитнес-клубы, стриминговые сервисы.",
      },
      {
        id: "integrations",
        title: "Интеграции",
        short: "Связь оплат с CRM и учётными системами",
        description: "Автоматизируем учёт платежей — связываем эквайринг с вашей CRM, бухгалтерией и складом, чтобы данные передавались без ручного ввода.",
        includes: [
          "Интеграция с CRM (Bitrix24, AmoCRM)",
          "Интеграция с 1С и бухгалтерией",
          "Передача данных в склад",
          "Автоматические чеки клиентам",
          "Отчётность",
          "Webhooks и API",
        ],
        timeline: "7–14 дней",
        bestFor: "Компании с большим оборотом, оптовая торговля, B2B.",
      },
      {
        id: "security",
        title: "Безопасность",
        short: "Защита платежей по стандарту PCI DSS",
        description: "Настраиваем безопасные платёжные потоки. Данные карт не хранятся на вашем сервере — всё проходит через сертифицированных провайдеров.",
        includes: [
          "Соответствие PCI DSS",
          "Шифрование TLS/SSL",
          "Защита от фрода и 3D-Secure",
          "Безопасное хранение токенов",
          "Логирование операций",
          "Регулярный аудит",
        ],
        timeline: "входит в проект",
        bestFor: "Любой проект, работающий с платежами клиентов.",
      },
    ],
  },
  {
    id: 3,
    number: "03",
    title: "Дизайн и брендинг",
    description: "Создание уникального визуального стиля для вашего бизнеса и продукта.",
    items: [
      {
        id: "logo",
        title: "Логотип",
        short: "Разработка фирменного знака",
        description: "Создаём узнаваемый логотип, который отражает суть вашего бизнеса. Не просто красивая картинка — а знак, который работает на бренд.",
        includes: [
          "Анализ ниши и конкурентов",
          "3–5 концептов на выбор",
          "Доработки выбранного варианта",
          "Варианты для тёмного/светлого фона",
          "Файлы: SVG, PNG, AI, PDF",
          "Презентация логотипа",
        ],
        timeline: "7–14 дней",
        bestFor: "Новый бизнес, ребрендинг, запуск продукта.",
      },
      {
        id: "identity",
        title: "Айдентика",
        short: "Полный фирменный стиль",
        description: "Целостный визуальный язык бренда: цвета, типографика, паттерны, иконки. Применяем на всех носителях — от визиток до соцсетей.",
        includes: [
          "Цветовая палитра",
          "Типографика (шрифты, иерархия)",
          "Графические элементы и паттерны",
          "Визитки, бланки, презентации",
          "Шаблоны для соцсетей",
          "Mockups и применение",
        ],
        timeline: "14–21 день",
        bestFor: "Компании, которые хотят выделиться, премиум-бренды, B2B.",
      },
      {
        id: "uiux",
        title: "UI/UX",
        short: "Дизайн интерфейсов сайтов и приложений",
        description: "Проектируем удобные и красивые интерфейсы — от первого прототипа до финальных макетов. Делаем так, чтобы пользователю было легко и приятно.",
        includes: [
          "UX-исследование и анализ",
          "Wireframes и прототипы",
          "UI-дизайн в Figma",
          "Дизайн-система и компоненты",
          "Адаптивные макеты",
          "Интерактивный прототип",
        ],
        timeline: "14–30 дней",
        bestFor: "Web-приложения, мобильные приложения, SaaS, e-commerce.",
      },
      {
        id: "brandbook",
        title: "Brand-book",
        short: "Полный гайд по использованию бренда",
        description: "PDF-документ с правилами использования бренда — чтобы любой подрядчик или сотрудник применял айдентику правильно.",
        includes: [
          "Концепция и миссия",
          "Логотип: правила и запреты",
          "Цветовая палитра",
          "Типографика",
          "Tone of voice",
          "Примеры применения",
        ],
        timeline: "10–14 дней",
        bestFor: "Компании с несколькими подрядчиками, франшизы, корпорации.",
      },
    ],
  },
  {
    id: 4,
    number: "04",
    title: "SMM-маркетинг",
    description: "Продвижение вашего бизнеса в социальных сетях для привлечения клиентов.",
    items: [
      {
        id: "content",
        title: "Контент-план",
        short: "Стратегия публикаций на месяц вперёд",
        description: "Разрабатываем продуманный контент-план: какие посты, в какие дни, с какой целью. Никакого хаоса — только стратегия.",
        includes: [
          "Анализ аудитории и конкурентов",
          "Стратегия и tone of voice",
          "Темы и рубрики",
          "План публикаций на 30 дней",
          "Тексты постов и сторис",
          "Календарь выхода",
        ],
        timeline: "5–7 дней + ежемесячно",
        bestFor: "Бренды, рестораны, услуги, локальный бизнес.",
      },
      {
        id: "visual",
        title: "Визуал",
        short: "Единый стиль для соцсетей",
        description: "Создаём узнаваемый визуальный стиль для соцсетей — шаблоны постов, сторис, обложки, рилсы. Лента становится цельной и красивой.",
        includes: [
          "Концепция визуала",
          "Шаблоны постов в Figma",
          "Шаблоны сторис",
          "Дизайн обложек хайлайтов",
          "Графика для рилсов",
          "Гайд по применению",
        ],
        timeline: "7–10 дней",
        bestFor: "Instagram, TikTok, Telegram-каналы, личные бренды.",
      },
      {
        id: "targeting",
        title: "Таргет",
        short: "Настройка и ведение рекламы",
        description: "Настраиваем таргетированную рекламу в Instagram и Facebook так, чтобы вы получали заявки, а не сливали бюджет.",
        includes: [
          "Анализ аудитории и сегментация",
          "Креативы и тексты",
          "Настройка кампаний",
          "А/Б-тестирование",
          "Ежедневный мониторинг",
          "Еженедельные отчёты",
        ],
        timeline: "запуск 3–5 дней + ведение",
        bestFor: "Бизнес с понятной воронкой продаж: услуги, e-commerce, мероприятия.",
      },
      {
        id: "analytics",
        title: "Аналитика",
        short: "Отчёты, метрики, оптимизация",
        description: "Считаем всё, что важно: охваты, вовлечённость, заявки, стоимость клиента. Принимаем решения на основе данных, а не догадок.",
        includes: [
          "Настройка систем аналитики",
          "Отслеживание ключевых метрик",
          "Еженедельные отчёты",
          "Анализ воронки",
          "Рекомендации по оптимизации",
          "Презентация результатов",
        ],
        timeline: "постоянно",
        bestFor: "Компании, которые хотят расти осмысленно и считать ROI.",
      },
    ],
  },
]

export type PortfolioItem = {
  id: number
  // Stable case-route id (API always provides it; optional for the legacy
  // static fallback array below).
  slug?: string
  name: string
  subtitle: string
  description: string
  // Long-form copy for the case page; falls back to `description` when empty.
  case_description?: string
  // Cross-app contract: mirror backend CATEGORY_CHOICES + admin CATEGORY_OPTIONS.
  category: "Разработка" | "SMM" | "Дизайн" | "Реклама"
  tags: string[]
  accent: string
  logo?: string
  // Project screenshot shown inside the device mockup; falls back to `logo`.
  cover?: string | null
  url?: string
  // Link to the live site (shown on the case page only).
  site_url?: string
  initials?: string
}

export const portfolio: PortfolioItem[] = [
  {
    id: 1,
    name: "Khotiri Jam",
    subtitle: "центр детской терапии",
    description: "Корпоративный сайт медицинского центра с акцентом на доверие, команду специалистов и онлайн-запись.",
    category: "Разработка",
    tags: ["Website", "Healthcare", "UX"],
    accent: "#14B8A6",
    logo: "/logos/khotiri-jam.png",
    url: "https://www.khotirijam.tj/",
  },
  {
    id: 2,
    name: "SABT Business",
    subtitle: "онлайн-запись для бизнеса",
    description: "SaaS-платформа для записи клиентов, управления расписанием и автоматических напоминаний.",
    category: "Разработка",
    tags: ["SaaS", "CRM", "Booking"],
    accent: "#8B5CF6",
    logo: "/logos/sabt.png",
    url: "https://sabt.tj/",
  },
  {
    id: 3,
    name: "Todo",
    subtitle: "маркетплейс еды и продуктов",
    description: "Платформа для подключения магазинов, увеличения продаж и узнаваемости брендов.",
    category: "Разработка",
    tags: ["Marketplace", "E-commerce", "Web App"],
    accent: "#EC4899",
    logo: "/logos/todo.webp",
    url: "https://todo.tj/",
  },
  {
    id: 4,
    name: "BARF",
    subtitle: "корпоративные подарки",
    description: "Создание интернет-магазина для новогодних корпоративных подарков с акцентом на премиальность.",
    category: "Разработка",
    tags: ["Landing", "Brand", "E-commerce"],
    accent: "#DC2626",
    url: "https://www.barf.tj/",
  },
  {
    id: 5,
    name: "GetUp",
    subtitle: "интернет-магазин автозапчастей",
    description: "Каталог автозапчастей с фильтрами по маркам и быстрой системой заказов.",
    category: "Разработка",
    tags: ["E-commerce", "Catalog", "Platform"],
    accent: "#F59E0B",
    logo: "/logos/getup.jpg",
    url: "https://getup.tj/",
  },
  {
    id: 14,
    name: "iram.cinema",
    subtitle: "кинотеатр в Душанбе",
    description: "Сайт для самого большого и атмосферного кинотеатра Душанбе: расписание сеансов, онлайн-бронирование билетов и закрытая зона для подписчиков.",
    category: "Разработка",
    tags: ["Website", "Cinema", "Booking"],
    accent: "#F97316",
    initials: "IC",
    url: "https://www.iramcinema.tj/",
  },
  {
    id: 13,
    name: "Grant China",
    subtitle: "образование в Китае без посредников",
    description: "Сайт для поступления в топ-университеты Китая: языковые курсы, колледж, бакалавриат и магистратура. Полное сопровождение от выбора программы до зачисления.",
    category: "Разработка",
    tags: ["Website", "Education", "Lead-gen"],
    accent: "#DC2626",
    logo: "/logos/grantchina.webp",
    url: "https://www.grantchina.tj/",
  },
  {
    id: 6,
    name: "SHAKL",
    subtitle: "дизайн интерьеров",
    description: "SMM и визуал для бренда интерьеров: позиционирование и привлечение премиум-аудитории.",
    category: "SMM",
    tags: ["Instagram", "Visual", "Brand"],
    accent: "#9C2228",
    logo: "/logos/shakl.png",
    url: "https://www.instagram.com/shakl.tj/",
  },
  {
    id: 7,
    name: "Loftory",
    subtitle: "мебель и столы в стиле Loft",
    description: "Сайт-каталог мебели и столов из металла и ЛДСП. Индивидуальный заказ, рассрочка и доставка по Душанбе.",
    category: "Разработка",
    tags: ["Website", "Catalog", "Furniture"],
    accent: "#1F2937",
    logo: "/logos/loftory.webp",
    url: "https://www.loftory.tj/",
  },
  {
    id: 8,
    name: "Armut Cafe",
    subtitle: "турецкая кухня",
    description: "Продвижение ресторана: контент, вовлечённость и формирование лояльной аудитории.",
    category: "SMM",
    tags: ["Restaurant", "Instagram", "Engagement"],
    accent: "#1D4ED8",
    logo: "/logos/armut.png",
    url: "https://www.instagram.com/armut.cafe/",
  },
  {
    id: 9,
    name: "BARF",
    subtitle: "подарочные боксы",
    description: "SMM и визуал для корпоративных и персональных подарков.",
    category: "SMM",
    tags: ["Instagram", "Sales", "Brand"],
    accent: "#7C1D1D",
    logo: "/logos/barf.webp",
    url: "https://www.instagram.com/barf.dushanbe/",
  },
  {
    id: 10,
    name: "SABT",
    subtitle: "онлайн-запись",
    description: "Контент и объяснение продукта для сервиса онлайн-записи и автоматизации.",
    category: "SMM",
    tags: ["SaaS", "Instagram", "Education"],
    accent: "#5B21B6",
    logo: "/logos/sabt.png",
    url: "https://www.instagram.com/sabt.online.tj/",
  },
  {
    id: 11,
    name: "Sapporo",
    subtitle: "доставка японской кухни",
    description: "Продвижение доставки еды: визуал, акции и постоянная коммуникация.",
    category: "SMM",
    tags: ["Food", "Delivery", "Instagram"],
    accent: "#991B1B",
    logo: "/logos/sapporo.webp",
    url: "https://www.instagram.com/sapporo_dushanbe/",
  },
  {
    id: 12,
    name: "ASAN",
    subtitle: "клиника офтальмологии",
    description: "Контент для медицинской клиники: доверие, экспертиза и услуги.",
    category: "SMM",
    tags: ["Healthcare", "Instagram", "Trust"],
    accent: "#047857",
    logo: "/logos/asan.webp",
    url: "https://www.instagram.com/asan_dushanbe/",
  },
]

export type Partner = {
  name: string
  logo?: string
}

export const partners: Partner[] = [
  { name: "Корманд TJ", logo: "/logos/kormand.png" },
  { name: "SHAKL", logo: "/logos/shakl.png" },
  { name: "SABT", logo: "/logos/sabt.png" },
  { name: "Айва", logo: "/logos/aiva.webp" },
  { name: "LOFTORY", logo: "/logos/loftory.webp" },
  { name: "GetUp", logo: "/logos/getup.jpg" },
  { name: "АСАН", logo: "/logos/asan.webp" },
  { name: "Армут", logo: "/logos/armut.png" },
  { name: "STAR", logo: "/logos/star.webp" },
  { name: "SAPPORO", logo: "/logos/sapporo.webp" },
  { name: "BARF", logo: "/logos/barf.webp" },
  { name: "Khotiri Jam", logo: "/logos/khotiri-jam.png" },
  { name: "Todo", logo: "/logos/todo.webp" },
  { name: "Grant China", logo: "/logos/grantchina.webp" },
  { name: "iram.cinema", logo: "/logos/iram-cinema.png" },
  { name: "Javonon Group", logo: "/logos/javonon-group.webp" },
]

// Applicant experience enum — cross-app contract. Keep in sync with
// backend/apps/choices.py (EXPERIENCE_VALUES) and admin-panel/src/lib/options.ts.
export const EXPERIENCE_OPTIONS = [
  'без опыта',
  'до 1 года',
  '1–3 года',
  '3–5 лет',
  '5+ лет',
] as const

export type Vacancy = {
  id: string
  title: string
  tagline: string
  type: string
  tags: string[]
  icon: string // lucide-react icon name, mapped in Careers.tsx
  accent: string // brand-scale token used for the role icon tint
  // Applicant requirements (optional; set in the admin, shown to candidates)
  experience_required?: string
  age_min?: number | null
  age_max?: number | null
  resume_required?: boolean
}

export const vacancies: Vacancy[] = [
  {
    id: "designer",
    title: "Дизайнер",
    tagline: "Создаёшь визуал брендов: от логотипа и айдентики до интерфейсов сайтов и приложений.",
    type: "Полная занятость · Душанбе",
    tags: ["Графдизайн", "UI/UX", "Figma"],
    icon: "Palette",
    accent: "brand-600",
  },
  {
    id: "smm",
    title: "SMM-специалист",
    tagline: "Ведёшь соцсети клиентов: контент-план, тексты, съёмки и вовлечение аудитории.",
    type: "Полная занятость · Гибрид",
    tags: ["Instagram", "Контент", "Stories"],
    icon: "Megaphone",
    accent: "brand-500",
  },
  {
    id: "sales",
    title: "Менеджер по продажам",
    tagline: "Общаешься с клиентами, ведёшь сделки и помогаешь бизнесу выбрать решение.",
    type: "Полная занятость · Офис",
    tags: ["Переговоры", "CRM", "B2B"],
    icon: "Handshake",
    accent: "brand-700",
  },
  {
    id: "frontend",
    title: "Frontend-разработчик",
    tagline: "Верстаешь и оживляешь современные адаптивные сайты на React и Tailwind.",
    type: "Полная занятость · Удалённо",
    tags: ["React", "TypeScript", "Tailwind"],
    icon: "Code2",
    accent: "brand-600",
  },
  {
    id: "targetolog",
    title: "Таргетолог",
    tagline: "Настраиваешь рекламу в Instagram и Facebook и приносишь клиентам заявки, а не сливы бюджета.",
    type: "Проектная занятость · Удалённо",
    tags: ["Meta Ads", "Аналитика", "Бюджеты"],
    icon: "Target",
    accent: "brand-500",
  },
  {
    id: "content",
    title: "Контент-мейкер",
    tagline: "Снимаешь и монтируешь Reels и ролики, которые набирают охваты и продают.",
    type: "Гибкий график · Душанбе",
    tags: ["Reels", "Съёмка", "Монтаж"],
    icon: "Clapperboard",
    accent: "brand-700",
  },
]

export const contacts = {
  phone: "+992 988 64 55 43",
  phoneRaw: "+992988645543",
  email: "info@webrand.tj",
  telegram: "https://t.me/Webrandushanbe",
  socials: {
    telegram: "https://t.me/Webrandushanbe",
    instagram: "https://www.instagram.com/webrand.tj",
    whatsapp: "https://wa.me/992985829367",
  },
}
