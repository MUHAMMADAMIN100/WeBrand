import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Class names with conflicts resolved: the last Tailwind utility of a kind wins. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
