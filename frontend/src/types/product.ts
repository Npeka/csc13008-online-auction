import type { Category } from "./category";
import type { User } from "./user";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string; // Rich text HTML
  images: ProductImage[];
  categoryId: string;
  category: Category;
  sellerId?: string;
  seller: User;

  // Pricing
  startingPrice: number;
  currentPrice: number;
  bidStep: number;
  buyNowPrice?: number;

  // Timing
  createdAt: string;
  endTime: string;
  autoExtend?: boolean;

  // Stats
  bidCount: number;
  viewCount: number;
  watchCount: number;

  // Status
  status: "active" | "ended" | "sold" | "cancelled";

  // Current winner
  highestBidderId?: string;
  highestBidder?: User;

  // Flags
  isNew?: boolean;
  isFeatured?: boolean;
  startTime?: string;
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
