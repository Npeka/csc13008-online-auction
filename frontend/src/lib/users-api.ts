import type { User } from "@/types";
import apiClient from "./api-client";

export interface UpdateProfileData {
  name?: string;
  address?: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
}

const transformUser = (backendUser: any): User => {
  return {
    id: backendUser.id,
    fullName: backendUser.name,
    email: backendUser.email,
    avatar: backendUser.avatar,
    role: backendUser.role,
    address: backendUser.address,
    dateOfBirth: backendUser.dateOfBirth,
    createdAt: backendUser.createdAt,
    rating: {
      positive: Math.max(0, backendUser.rating || 0),
      negative: Math.max(0, -Math.min(0, backendUser.rating || 0)),
      total: backendUser.ratingCount || 0,
    },
    isVerified: backendUser.emailVerified,
  };
};

export interface RatingSummary {
  ratings: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    giver: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  summary: {
    positive: number;
    negative: number;
    total: number;
    percentage: number;
  };
}

export interface UpgradeRequest {
  id: string;
  userId: string;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    rating: number;
    ratingCount: number;
    createdAt: string;
  };
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const data = await apiClient.get("/users/me");
    return transformUser(data);
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const responseData = await apiClient.patch("/users/me", data);
    return transformUser(responseData);
  },

  getRatings: async (): Promise<RatingSummary> => {
    return await apiClient.get("/users/me/ratings");
  },

  createUpgradeRequest: async (reason?: string): Promise<UpgradeRequest> => {
    return await apiClient.post("/users/upgrade-request", { reason });
  },

  getUpgradeRequests: async (): Promise<UpgradeRequest[]> => {
    return await apiClient.get("/users/admin/upgrade-requests");
  },

  processUpgradeRequest: async (
    requestId: string,
    status: "APPROVED" | "REJECTED",
    adminComment?: string,
  ): Promise<UpgradeRequest> => {
    return await apiClient.patch(`/users/admin/upgrade-requests/${requestId}`, {
      status,
      adminComment,
    });
  },

  getPublicProfile: async (userId: string) => {
    return await apiClient.get<{
      id: string;
      name: string;
      avatar: string | null;
      role: string;
      rating: number;
      ratingCount: number;
      createdAt: string;
    }>(`/users/${userId}/public`);
  },
};
