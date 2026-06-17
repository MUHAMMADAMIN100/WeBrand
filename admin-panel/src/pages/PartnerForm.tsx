import { ImagePlus, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Drawer } from '../components/ui/Drawer'
import { Button } from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Field'
import type { Partner } from '../lib/types'
import { createPartner, updatePartner, type PartnerInput } from '../api/resources'
import { useToast } from '../context/ToastContext'

type FormState = { name: string; niche: string; description: string; result: string; link: string }

const emptyForm: FormState = { name: '', niche: '', description: '', result: '', link: '' }

function fromPartner(p: Partner): FormState {
  return { name: p.name, niche: p.niche, description: p.description, result: p.result, link: p.link ?? '' }
}

export function PartnerForm({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial: Partner | null
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const isEdit = !!initial
  const [form, setForm] = useState<FormState>(initial ? fromPartner(initial) : emptyForm)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const onPickFile = (file: File | null) => {
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : null)
  }

  const currentLogo = logoPreview ?? initial?.logo ?? null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Укажите название'
    if (form.link && !/^https?:\/\//i.test(form.link)) e.link = 'Ссылка должна начинаться с http(s)://'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSaving(true)
    const payload: PartnerInput = {
      name: form.name.trim(),
      niche: form.niche.trim(),
      description: form.description.trim(),
      result: form.result.trim(),
      link: form.link.trim(),
      sort_order: initial?.sort_order ?? 0,
      logo: logoFile,
    }
    try {
      if (isEdit) {
        await updatePartner(initial!.id, payload)
        toast.success('Партнёр обновлён')
      } else {
        await createPartner(payload)
        toast.success('Партнёр добавлен')
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
      title={isEdit ? 'Редактировать партнёра' : 'Новый партнёр'}
      subtitle={isEdit ? initial!.name : 'Заполните поля и сохраните'}
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
        {/* Logo upload — same multipart flow as project logos. */}
        <Field label="Логотип" hint="PNG / JPG / WEBP, необязательно">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
              {currentLogo ? (
                <img src={currentLogo} alt="" className="max-h-16 max-w-16 object-contain" />
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
                {currentLogo ? 'Заменить' : 'Загрузить'}
              </Button>
              {logoFile && (
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

        <Field label="Название" required error={errors.name}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Напр. «Sapporo»" error={!!errors.name} maxLength={120} />
        </Field>

        <Field label="Ниша" hint="необязательно">
          <Input value={form.niche} onChange={(e) => set('niche', e.target.value)} placeholder="Напр. «Ресторан»" maxLength={120} />
        </Field>

        <Field label="О компании" hint="основной текст для модалки на сайте, необязательно">
          <Textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={5}
            placeholder="Расскажите о партнёре: чем занимается, что делали вместе, какой результат…"
          />
        </Field>

        <Field label="Результат" hint="короткая строка — выделяется бейджем в модалке, необязательно">
          <Textarea
            value={form.result}
            onChange={(e) => set('result', e.target.value)}
            rows={2}
            placeholder="Напр. «Рост охватов в 3 раза за 2 месяца»"
          />
        </Field>

        <Field label="Ссылка" error={errors.link} hint="служебное · на сайте не показывается">
          <Input value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://example.com" error={!!errors.link} />
        </Field>
      </div>
    </Drawer>
  )
}
