import type { User } from "./user";

export interface Bid {
  id: string;
  productId: string;
  bidderId?: string;
  bidder: User;
  amount: number;
  createdAt: string;
  isAutoBid?: boolean;
}
