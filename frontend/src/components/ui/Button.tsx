import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'ink' | 'primary' | 'lime' | 'outline' | 'outline-light'
type Size = 'md' | 'lg'

const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2.5 rounded-full font-semibold ' +
  'transition-[background-color,color,border-color,box-shadow] duration-300 ease-expo ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  // The default call to action: ink that turns brand blue under the pointer.
  ink: 'bg-ink-950 text-white hover:bg-brand-600',
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  // For dark and blue surfaces, where ink and blue would both disappear.
  lime: 'bg-lime text-ink-950 hover:bg-white focus-visible:ring-lime focus-visible:ring-offset-ink-950',
  outline: 'border-2 border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-white',
  'outline-light':
    'border-2 border-white/30 text-white hover:border-white hover:bg-white hover:text-ink-950 focus-visible:ring-lime focus-visible:ring-offset-ink-950',
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-8 text-base',
}

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode }
type AsButton = Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined }
type AsLink = Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string }

/** The one button of the design system. Renders an `<a>` when given `href`
 *  (in-page anchors and external links — Next `<Link>` stays the tool for
 *  route navigation), otherwise a `<button type="button">`. */
export default function Button(props: AsButton | AsLink) {
  const { variant = 'ink', size = 'md', className, children, ...rest } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  if (typeof rest.href === 'string') {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={classes}>
      {children}
    </button>
  )
}
