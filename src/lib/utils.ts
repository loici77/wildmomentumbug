import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('ko-KR').format(num);
}

export function formatCurrency(num: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(num).replace('₩', '');
}

export function formatNet(num: number) {
  const val = Math.round(num / 10000);
  return (val > 0 ? '+' : '') + val + '만';
}
