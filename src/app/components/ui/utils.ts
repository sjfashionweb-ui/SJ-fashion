import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// NEW: Global currency formatter
export function formatLKR(amount: number) {
  return amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}