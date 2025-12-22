import type { User } from "./user";

export interface UpgradeRequest {
  id: string;
  userId: string;
  user: User;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}
