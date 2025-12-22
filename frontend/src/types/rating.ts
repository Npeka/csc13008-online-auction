import type { User } from "./user";

export interface Rating {
  id: string;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  orderId: string;
  score: 1 | -1;
  comment: string;
  createdAt: string;
}
