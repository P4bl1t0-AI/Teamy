import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate une Date en YYYY-MM-DD en heure LOCALE.
 * ⚠️ Ne PAS utiliser toISOString().split('T')[0] — ça convertit en UTC
 * et décale d'un jour en Europe (UTC+1/UTC+2).
 */
export function formatDateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
