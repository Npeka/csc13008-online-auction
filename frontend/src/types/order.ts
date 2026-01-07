import type { Product } from "./product";
import type { Rating } from "./rating";
import type { User } from "./user";
import type { ChatMessage } from "./chat-message";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_SUBMITTED"
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

  // Shipping & Payment
  paymentProof?: string;
  shippingProof?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  cancellationReason?: string;

  // Timestamps
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;

  // Chat and ratings
  messages?: ChatMessage[];
  ratings?: Rating[];
  buyerRating?: Rating;
  sellerRating?: Rating;
}
