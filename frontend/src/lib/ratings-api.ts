import { apiClient } from "./api-client";

export interface CreateRatingDto {
  rating: number; // +1 or -1
  comment?: string;
  receiverId: string;
  orderId?: string;
}

export interface Rating {
  id: string;
  rating: number;
  comment?: string;
  giverId: string;
  receiverId: string;
  orderId?: string;
  createdAt: string;
  giver: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface RatingSummary {
  positive: number;
  negative: number;
  total: number;
  percentage: number;
}

export const ratingsApi = {
  /**
   * Create a new rating
   */
  async createRating(data: CreateRatingDto): Promise<Rating> {
    return await apiClient.post("/ratings", data);
  },

  /**
   * Get ratings for a specific user
   */
  async getUserRatings(userId: string): Promise<{
    ratings: Rating[];
    summary: RatingSummary;
  }> {
    return await apiClient.get(`/ratings/users/${userId}`);
  },

  /**
   * Get my rating summary
   */
  async getMyRatingSummary(): Promise<RatingSummary> {
    return await apiClient.get("/ratings/me/summary");
  },
};
