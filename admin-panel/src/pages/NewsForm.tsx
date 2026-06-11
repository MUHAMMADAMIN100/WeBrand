import { ImagePlus, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Drawer } from '../components/ui/Drawer'
import { Button } from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Field'
import { ChipInput } from '../components/ui/ChipInput'
import { Toggle } from '../components/ui/Toggle'
import type { News } from '../lib/types'
import { createNews, updateNews, type NewsInput } from '../api/resources'
import { useToast } from '../context/ToastContext'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Cyrillic → latin transliteration for auto-suggesting a slug from the title.
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ISO → value for <input type="datetime-local"> (local YYYY-MM-DDTHH:mm).
function toLocalInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type FormState = {
  slug: string
  title: string
  excerpt: string
  body: string
  meta_title: string
  meta_description: string
  keywords: string[]
  is_published: boolean
  published_at: string
  sort_order: number
}

const empty: FormState = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  meta_title: '',
  meta_description: '',
  keywords: [],
  is_published: true,
  published_at: '',
  sort_order: 0,
}

function fromNews(n: News): FormState {
  return {
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    body: n.body,
    meta_title: n.meta_title,
    meta_description: n.meta_description,
    keywords: n.keywords,
    is_published: n.is_published,
    published_at: toLocalInput(n.published_at),
    sort_order: n.sort_order,
  }
}

export function NewsForm({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial: News | null
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const isEdit = !!initial
  const [form, setForm] = useState<FormState>(initial ? fromNews(initial) : empty)
  // Whether the user manually edited the slug — once true we stop auto-deriving it.
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const onTitleChange = (value: string) => {
    setForm((f) => ({
      ...f,
      title: value,
      // Auto-fill the slug from the title until the user edits the slug directly.
      slug: !isEdit && !slugTouched ? slugify(value) : f.slug,
    }))
  }

  const onPickFile = (file: File | null) => {
    setCoverFile(file)
    setCoverPreview(file ? URL.createObjectURL(file) : null)
  }

  const currentCover = coverPreview ?? initial?.cover ?? null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!isEdit) {
      if (!form.slug.trim()) e.slug = 'Укажите slug'
      else if (!SLUG_RE.test(form.slug)) e.slug = 'Только строчные латинские буквы, цифры и дефис'
    }
    if (!form.title.trim()) e.title = 'Укажите заголовок'
    if (!form.excerpt.trim()) e.excerpt = 'Добавьте краткое описание'
    if (!form.body.trim()) e.body = 'Добавьте текст статьи'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSaving(true)
    const payload: NewsInput = { ...form, cover: coverFile }
    try {
      if (isEdit) {
        await updateNews(initial!.slug, payload)
        toast.success('Статья обновлена')
      } else {
        await createNews(payload)
        toast.success('Статья создана')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Редактировать статью' : 'Новая статья'}
      subtitle={isEdit ? `slug: ${initial!.slug}` : 'Заполните поля и сохраните'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={submit} loading={saving}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Cover upload */}
        <Field label="Обложка" hint="PNG / JPG / WEBP, необязательно">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
              {currentCover ? (
                <img src={currentCover} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
              <Button variant="secondary" size="sm" icon={<Upload className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
                {currentCover ? 'Заменить' : 'Загрузить'}
              </Button>
              {coverFile && (
                <button
                  type="button"
                  onClick={() => onPickFile(null)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" /> Убрать новый файл
                </button>
              )}
            </div>
          </div>
        </Field>

        <Field label="Заголовок" required error={errors.title}>
          <Input value={form.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Как создать сайт для бизнеса" error={!!errors.title} />
        </Field>

        <Field
          label="Идентификатор (slug)"
          required={!isEdit}
          error={errors.slug}
          hint={isEdit ? '(нельзя изменить)' : 'в URL: /news/<slug>'}
        >
          <Input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              set('slug', e.target.value)
            }}
            placeholder="kak-sozdat-sayt"
            disabled={isEdit}
            error={!!errors.slug}
          />
        </Field>

        <Field label="Краткое описание (excerpt)" required error={errors.excerpt} hint="для карточки и превью">
          <Textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} error={!!errors.excerpt} />
        </Field>

        <Field label="Текст статьи" required error={errors.body} hint="HTML: <h2>, <p>, <ul>…">
          <Textarea
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            rows={12}
            placeholder="<p>Вступление…</p>&#10;<h2>Подзаголовок</h2>&#10;<p>…</p>"
            className="font-mono text-xs leading-relaxed"
            error={!!errors.body}
          />
        </Field>

        {/* SEO block */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/50 p-4">
          <div className="mb-3 text-sm font-bold text-neutral-700 dark:text-neutral-200">SEO</div>
          <div className="space-y-4">
            <Field label="Meta title" hint="пусто → заголовок">
              <Input value={form.meta_title} onChange={(e) => set('meta_title', e.target.value)} maxLength={70} placeholder="SEO-заголовок" />
            </Field>
            <Field label="Meta description" hint="пусто → краткое описание">
              <Textarea value={form.meta_description} onChange={(e) => set('meta_description', e.target.value)} rows={2} maxLength={200} placeholder="SEO-описание (140–160 символов)" />
            </Field>
            <Field label="Ключевые слова" hint="Enter для добавления">
              <ChipInput value={form.keywords} onChange={(k) => set('keywords', k)} placeholder="сайт, бизнес, Душанбе…" />
            </Field>
          </div>
        </div>

        {/* Порядок задаётся перетаскиванием в таблице новостей — здесь поля нет. */}
        <Field label="Дата публикации" hint="необязательно">
          <Input
            type="datetime-local"
            value={form.published_at}
            onChange={(e) => set('published_at', e.target.value)}
          />
        </Field>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3">
          <Toggle
            checked={form.is_published}
            onChange={(v) => set('is_published', v)}
            label="Публикация"
            description={form.is_published ? 'Видна на сайте' : 'Черновик'}
          />
        </div>
      </div>
    </Drawer>
  )
}
