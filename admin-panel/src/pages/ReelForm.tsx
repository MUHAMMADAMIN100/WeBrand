import { Youtube } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../components/ui/Drawer'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import type { Reel } from '../lib/types'
import { createReel, patchReel, type ReelInput } from '../api/resources'
import { youtubeId, youtubeThumb } from '../lib/youtube'
import { useToast } from '../context/ToastContext'

type FormState = { youtube_url: string; title: string }

const emptyForm: FormState = { youtube_url: '', title: '' }

export function ReelForm({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial: Reel | null
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const isEdit = !!initial
  const [form, setForm] = useState<FormState>(
    initial ? { youtube_url: initial.youtube_url, title: initial.title } : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  // Live preview of the cover so you can see the clip you just pasted.
  const videoId = youtubeId(form.youtube_url)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.youtube_url.trim()) e.youtube_url = 'Укажите ссылку на видео'
    else if (!videoId) e.youtube_url = 'Не удалось распознать видео YouTube — проверьте ссылку'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSaving(true)
    const payload: ReelInput = {
      youtube_url: form.youtube_url.trim(),
      title: form.title.trim(),
      sort_order: initial?.sort_order ?? 0,
    }
    try {
      if (isEdit) {
        await patchReel(initial!.id, payload)
        toast.success('Рилс обновлён')
      } else {
        await createReel(payload)
        toast.success('Рилс добавлен')
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
      title={isEdit ? 'Редактировать рилс' : 'Новый рилс'}
      subtitle={isEdit ? initial!.title || initial!.youtube_url : 'Вставьте ссылку на YouTube'}
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
        <Field
          label="Ссылка на YouTube"
          required
          error={errors.youtube_url}
          hint="watch?v=…, youtu.be/…, /shorts/…"
        >
          <Input
            value={form.youtube_url}
            onChange={(e) => set('youtube_url', e.target.value)}
            placeholder="https://youtu.be/dQw4w9WgXcQ"
            error={!!errors.youtube_url}
          />
        </Field>

        {/* Cover preview — confirms the link points at a real clip. */}
        <Field label="Превью">
          <div className="flex items-center gap-4">
            <div className="grid h-[72px] w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
              {videoId ? (
                <img
                  src={youtubeThumb(videoId)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <Youtube className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {videoId
                ? 'Так обложка появится на странице SMM.'
                : 'Вставьте ссылку — здесь появится обложка видео.'}
            </p>
          </div>
        </Field>

        <Field label="Заголовок" hint="необязательно">
          <Input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Напр. «Кейс ресторана: +30% охватов»"
            maxLength={160}
          />
        </Field>
      </div>
    </Drawer>
  )
}
