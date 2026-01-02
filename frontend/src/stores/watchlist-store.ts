import { create } from "zustand";
import { persist } from "zustand/middleware";
import { bidsApi } from "@/lib";
import type { Product } from "@/types";

interface WatchlistState {
  items: Product[];
  isLoading: boolean;
  addToWatchlist: (product: Product) => Promise<void>;
  removeFromWatchlist: (productId: string) => Promise<void>;
  fetchWatchlist: () => Promise<void>;
  isInWatchlist: (productId: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addToWatchlist: async (product) => {
        try {
          await bidsApi.addToWatchlist(product.id);
          set((state) => ({
            items: [...state.items, product],
          }));
        } catch (error) {
          console.error("Failed to add to watchlist:", error);
          throw error;
        }
      },

      removeFromWatchlist: async (productId) => {
        try {
          await bidsApi.removeFromWatchlist(productId);
          set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
          }));
        } catch (error) {
          console.error("Failed to remove from watchlist:", error);
          throw error;
        }
      },

      fetchWatchlist: async () => {
        set({ isLoading: true });
        try {
          const items = await bidsApi.getWatchlist();
          set({ items, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch watchlist:", error);
          set({ isLoading: false });
        }
      },

      isInWatchlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: "morphee-watchlist-storage",
    },
  ),
);

// Helper hook to get watchlist count
export const useWatchlistCount = () => {
  return useWatchlistStore((state) => state.items.length);
};
