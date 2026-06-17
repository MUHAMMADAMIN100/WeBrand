// Shapes mirror the Django API serializers.

export type Vacancy = {
  slug: string
  title: string
  tagline: string
  type: string
  tags: string[]
  icon: string
  accent: string
  sort_order: number
  is_published: boolean
  // Applicant requirements (all optional)
  experience_required: string
  age_min: number | null
  age_max: number | null
  resume_required: boolean
}

export type Project = {
  id: number
  legacy_id: number | null
  name: string
  subtitle: string
  description: string
  category: 'Разработка' | 'SMM'
  tags: string[]
  accent: string
  logo: string | null
  url: string | null
  initials: string | null
  sort_order: number
  is_published: boolean
  is_featured: boolean
}

// Showcase entities for the public /smm page. Mirror the Django showcase serializers.
export type Reel = {
  id: number
  youtube_url: string
  title: string
  sort_order: number
}

export type Partner = {
  id: number
  name: string
  logo: string | null // absolute URL or null
  niche: string
  description: string
  result: string
  link: string | null
  sort_order: number
}

// News list item (feed shape — no heavy body). Mirrors NewsListSerializer.
export type NewsListItem = {
  slug: string
  title: string
  excerpt: string
  cover: string | null
  keywords: string[]
  is_published: boolean
  published_at: string
  sort_order: number
}

// Full article incl. body + SEO fields. Mirrors NewsDetailSerializer.
export type News = NewsListItem & {
  body: string
  meta_title: string
  meta_description: string
  created_at: string
  updated_at: string
}

export type Lead = {
  id: number
  kind: 'lead' | 'application'
  kind_display: string
  role: string | null
  name: string
  contact: string
  phone: string
  message: string
  // Applicant fields (only kind=application populates them)
  experience: string
  age: number | null
  resume: string | null // absolute URL or null
  selected: string[]
  answers: Record<string, unknown>
  is_sent_to_telegram: boolean
  created_at: string
}
