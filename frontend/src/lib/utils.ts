import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Mask a name for privacy (e.g., "Nguyen Khoa" -> "****Khoa")
 */
export function maskName(name: string): string {
  if (!name) return "****";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return "****" + (parts[0].length > 2 ? parts[0].slice(-2) : parts[0]);
  }
  return "****" + parts[parts.length - 1];
}

/**
 * Format currency (VND)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format USD currency
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Calculate time remaining from now to end time
 */
export function getTimeRemaining(endTime: string | Date): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const total = end - now;

  if (total <= 0) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    isExpired: false,
  };
}

/**
 * Format relative time (e.g., "Ends in 2 days 5 hours")
 */
export function formatRelativeTime(endTime: string | Date): string {
  const { days, hours, minutes, isExpired } = getTimeRemaining(endTime);

  if (isExpired) return "Ended";

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

/**
 * Check if product is "NEW" (listed within N minutes)
 */
export function isNewProduct(
  createdAt: string | Date,
  minutesThreshold = 60,
): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - created) / (1000 * 60);
  return diffMinutes <= minutesThreshold;
}

/**
 * Calculate rating percentage
 */
export function calculateRatingPercentage(
  positive: number,
  total: number,
): number {
  if (total === 0) return 100; // New users get 100%
  return Math.round((positive / total) * 100);
}

/**
 * Format rating display (e.g., "15/18 (83%)")
 */
export function formatRating(positive: number, total: number): string {
  const percentage = calculateRatingPercentage(positive, total);
  return `${positive}/${total} (${percentage}%)`;
}

/**
 * Check if user has good rating (>= 80%)
 */
export function hasGoodRating(positive: number, total: number): boolean {
  if (total === 0) return true; // New users are allowed
  return calculateRatingPercentage(positive, total) >= 80;
}

/**
 * Generate a slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Delay utility for simulating API calls
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
