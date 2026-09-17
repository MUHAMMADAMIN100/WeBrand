import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge resolves conflicts by class *group*, and it can only guess the
// group of a class it has never heard of. Our fluid sizes (`text-display-xl`…)
// look like text colours to it, so next to a real colour such as `text-ink-950`
// it kept the colour and silently threw the size away — every section heading
// passed through `cn()` shrank to body size. Registering them as font sizes is
// the fix; add any new custom `text-*` size here too.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display-xl', 'display-lg', 'display-md'] }],
    },
  },
})

/** shadcn/ui convention — every 21st.dev component imports `cn` from here. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
