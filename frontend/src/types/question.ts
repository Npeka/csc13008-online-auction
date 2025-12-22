import type { User } from "./user";

export interface Question {
  id: string;
  productId: string;
  askerId?: string;
  asker: User;
  content: string;
  createdAt: string;
  answer?: {
    content: string;
    createdAt: string;
  };
}
