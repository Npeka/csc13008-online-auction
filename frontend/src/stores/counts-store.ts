import { create } from "zustand";
import { usersApi } from "@/lib/users-api";

interface CountsState {
  products: number;
  watchlist: number;
  bidding: number;
  won: number;
  isLoaded: boolean;
  fetchCounts: () => Promise<void>;
  resetCounts: () => void;
}

export const useCountsStore = create<CountsState>((set) => ({
  products: 0,
  watchlist: 0,
  bidding: 0,
  won: 0,
  isLoaded: false,

  fetchCounts: async () => {
    try {
      const counts = await usersApi.getUserCounts();
      set({
        ...counts,
        isLoaded: true,
      });
    } catch (error) {
      console.error("Failed to fetch counts:", error);
      // Set to 0 if fetch fails
      set({
        products: 0,
        watchlist: 0,
        bidding: 0,
        won: 0,
        isLoaded: true,
      });
    }
  },

  resetCounts: () => {
    set({
      products: 0,
      watchlist: 0,
      bidding: 0,
      won: 0,
      isLoaded: false,
    });
  },
}));

