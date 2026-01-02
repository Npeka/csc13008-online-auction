import type { Bid, Product } from "@/types";
import apiClient from "./api-client";

export interface MaskedBid extends Omit<Bid, "bidder"> {
  bidder: {
    id: string;
    name: string; // Masked name like ****Khoa
    rating: number;
    ratingCount: number;
  };
}

export const bidsApi = {
  // Place a bid
  placeBid: async (productId: string, amount: number): Promise<Bid> => {
    return await apiClient.post(`/bids/products/${productId}`, {
      amount,
    });
  },

  // Get bid history (with masked names)
  getBidHistory: async (productId: string): Promise<MaskedBid[]> => {
    return await apiClient.get(`/bids/products/${productId}/history`);
  },

  // Reject bidder (seller only)
  rejectBidder: async (
    productId: string,
    bidderId: string,
  ): Promise<{ message: string }> => {
    return await apiClient.post(
      `/bids/products/${productId}/reject/${bidderId}`,
    );
  },

  // Add to watchlist
  addToWatchlist: async (productId: string): Promise<void> => {
    await apiClient.post(`/bids/watchlist/${productId}`);
  },

  // Remove from watchlist
  removeFromWatchlist: async (productId: string): Promise<void> => {
    await apiClient.delete(`/bids/watchlist/${productId}`);
  },

  // Get watchlist
  getWatchlist: async (): Promise<Product[]> => {
    return await apiClient.get("/bids/watchlist");
  },

  // Get products I'm bidding on
  getMyBiddingProducts: async (): Promise<
    (Product & { isHighestBidder: boolean; currentBid: number })[]
  > => {
    return await apiClient.get("/bids/my-bidding");
  },

  // Get products I won
  getMyWonProducts: async (): Promise<Product[]> => {
    return await apiClient.get("/bids/my-won");
  },
};
