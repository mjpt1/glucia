import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert Persian (۰-۹) and Arabic (٠-٩) digits to Latin so numeric inputs accept Persian keyboards. */
export function faToEnDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function toJalali(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
}

export function toJalaliTime(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(d);
}

export function toJalaliDateTime(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
}

export function glucoseColor(value: number, min = 70, max = 180): string {
  if (value < 54) return '#dc2626';
  if (value < min) return '#ef4444';
  if (value <= max) return '#22c55e';
  if (value <= 250) return '#f97316';
  return '#ef4444';
}

export function glucoseLabel(value: number, min = 70, max = 180): string {
  if (value < 54) return 'افت شدید';
  if (value < min) return 'پایین';
  if (value <= max) return 'نرمال';
  if (value <= 250) return 'بالا';
  return 'خیلی بالا';
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(n));
}
