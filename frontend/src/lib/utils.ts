import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** shadcn/ui convention — every 21st.dev component imports `cn` from here. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
