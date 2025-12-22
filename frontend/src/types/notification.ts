export type NotificationType =
  | "bid_placed"
  | "outbid"
  | "auction_ending"
  | "auction_won"
  | "auction_ended"
  | "new_question"
  | "answer_received"
  | "payment_received"
  | "item_shipped"
  | "item_delivered";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  productId?: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}
