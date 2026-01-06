import type { Product } from "./product";
import type { Rating } from "./rating";
import type { User } from "./user";
import type { ChatMessage } from "./chat-message";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

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
  // Shipping & Payment
  paymentProof?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  cancellationReason?: string;

  // Timestamps
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;

  // Ratings
  // Chat and ratings
  messages?: ChatMessage[];
  buyerRating?: Rating;
  sellerRating?: Rating;
}
