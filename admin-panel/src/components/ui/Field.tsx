import { cloneElement, isValidElement, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

// One look for every text control: quiet border, brand ring on focus.
export const controlClass =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-ink-950 placeholder:text-ink-500 transition-[border-color,box-shadow] duration-200 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/15 disabled:bg-ink-100 disabled:text-ink-500 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20 dark:disabled:bg-ink-800'
export const controlBorder = 'border-ink-200 hover:border-ink-300 dark:border-ink-700 dark:hover:border-ink-600'
export const controlBorderError = 'border-red-500 focus:border-red-600 focus:ring-red-500/15'

export function Label({
  children,
  required,
  htmlFor,
  hint,
}: {
  children: ReactNode
  required?: boolean
  htmlFor?: string
  hint?: string
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink-950 dark:text-ink-100">
      {children}
      {required && (
        <span className="ml-0.5 text-brand-600 dark:text-brand-300" aria-hidden="true">
          *
        </span>
      )}
      {hint && <span className="ml-2 font-normal text-ink-600 dark:text-ink-400">{hint}</span>}
    </label>
  )
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-red-700 dark:text-red-400">
      {children}
    </p>
  )
}

export function Field({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  /** When the control is wrapped (icon inside the field), name its id here. */
  htmlFor?: string
  children: ReactNode
}) {
  // Tie the label to the control: a single child element gets the id (unless
  // it brought its own), so clicking the label focuses it and readers name it.
  const autoId = useId()
  const child = isValidElement<{ id?: string }>(children) ? children : null
  const id = child?.props.id ?? autoId
  const control = child && !child.props.id && !htmlFor ? cloneElement(child, { id }) : children
  return (
    <div>
      <Label required={required} hint={hint} htmlFor={htmlFor ?? (child ? id : undefined)}>
        {label}
      </Label>
      {control}
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function Input({ className = '', error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={error || undefined}
      className={cn(controlClass, 'h-11', error ? controlBorderError : controlBorder, className)}
    />
  )
}

export function Textarea({
  className = '',
  error,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...rest}
      aria-invalid={error || undefined}
      className={cn(controlClass, 'resize-y py-2.5', error ? controlBorderError : controlBorder, className)}
    />
  )
}

export function Select({
  className = '',
  error,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      {...rest}
      aria-invalid={error || undefined}
      className={cn(
        controlClass,
        `h-11 cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236B7180" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>')] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10`,
        error ? controlBorderError : controlBorder,
        className,
      )}
    >
      {children}
    </select>
  )
}
