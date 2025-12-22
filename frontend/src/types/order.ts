import type { Product } from "./product";
import type { User } from "./user";
import type { Rating } from "./rating";

export type OrderStatus =
  | "pending_payment"
  | "payment_submitted"
  | "payment_confirmed"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  productId: string;
  product: Product;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  finalPrice: number;
  status: OrderStatus;

  // Shipping
  shippingAddress?: string;
  trackingNumber?: string;

  // Timestamps
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;

  // Ratings
  buyerRating?: Rating;
  sellerRating?: Rating;
}
