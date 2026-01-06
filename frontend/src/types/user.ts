export type UserRole = "GUEST" | "BIDDER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  name?: string; // Added for compatibility with new repository responses
  email: string;
  avatar?: string;
  role: UserRole;
  address?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
  // Rating can be either the old object structure or the new flat structure
  rating:
    | number
    | {
        positive: number;
        negative?: number;
        total: number;
      };
  ratingCount?: number; // Added for new flat structure
  isVerified?: boolean;
  // Seller settings
  allowNewBidders?: boolean; // Allow bidders without ratings to bid on products
  sellerExpiresAt?: string | null; // When temporary seller privileges expire (null for permanent sellers)
}
