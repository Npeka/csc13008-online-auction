import type { Category } from "./category";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  title: string; // API uses title
  slug: string;
  description: string; // Rich text HTML
  images: (string | ProductImage)[];
  category?: Category;
  seller?: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    ratingCount: number;
  };

  // Pricing
  startPrice: number;
  currentPrice: number;
  bidStep: number;
  buyNowPrice?: number;

  // Timing
  createdAt: string;
  startTime: string;
  endTime: string;
  autoExtend?: boolean;
  extensionTriggerTime?: number;
  extensionDuration?: number;

  // Status
  status: "ACTIVE" | "ENDED";
  isActive?: boolean;
  allowNewBidders?: boolean;

  // Stats
  viewCount?: number;
  bidCount?: number;
  watchCount?: number;
  highestBidder?: {
    id: string;
    name: string;
    avatar?: string;
  };

  // Flags
  isNew?: boolean;
  isFeatured?: boolean;
  hasRated?: boolean; // Indicates if user has rated the seller (for won products)

  // Sold products specific
  buyerInfo?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

import type { PaginationParams } from "./common";

export interface ProductFilters extends PaginationParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  endingWithin?: "hour" | "day" | "week";
  minBids?: number;
  sortBy?:
    | "ending_asc"
    | "ending_desc"
    | "price_asc"
    | "price_desc"
    | "newest"
    | "most_bids";
  search?: string;
  status?: "active" | "ended";
}
