import type { User } from "./user";

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  sender: User;
  content: string;
  createdAt: string;
  isRead: boolean;
}
