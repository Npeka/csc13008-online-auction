export type UserRole = "guest" | "bidder" | "seller" | "admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  address?: string;
  dateOfBirth?: string;
  createdAt: string;
  rating: {
    positive: number;
    negative?: number;
    total: number;
  };
  isVerified?: boolean;
}
