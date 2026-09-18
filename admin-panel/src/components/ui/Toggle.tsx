export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ? undefined : checked ? 'Включено' : 'Выключено'}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      // -my-2/py-2: a 40px tall hit area around the 24px track, no extra layout height.
      className="group -my-2 flex w-full items-center justify-between gap-4 rounded-full py-2 text-left disabled:opacity-60"
    >
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-semibold text-ink-950 dark:text-ink-100">{label}</span>}
          {description && <span className="block text-xs text-ink-600 dark:text-ink-400">{description}</span>}
        </span>
      )}
      {/* On: ink track (lime in the dark theme) — the site's "live" marker. */}
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-ink-950 dark:bg-lime' : 'bg-ink-300 dark:bg-ink-700'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-[22px] bg-lime dark:bg-ink-950' : 'translate-x-0.5 bg-white'
          }`}
        />
      </span>
    </button>
  )
}
