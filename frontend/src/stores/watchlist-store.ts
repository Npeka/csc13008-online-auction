import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistState {
  productIds: string[];
  isInWatchlist: (productId: string) => boolean;
  addToWatchlist: (productId: string) => void;
  removeFromWatchlist: (productId: string) => void;
  toggleWatchlist: (productId: string) => void;
  clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      isInWatchlist: (productId: string) => {
        return get().productIds.includes(productId);
      },

      addToWatchlist: (productId: string) => {
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds
            : [...state.productIds, productId],
        }));
      },

      removeFromWatchlist: (productId: string) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      toggleWatchlist: (productId: string) => {
        const { isInWatchlist, addToWatchlist, removeFromWatchlist } = get();
        if (isInWatchlist(productId)) {
          removeFromWatchlist(productId);
        } else {
          addToWatchlist(productId);
        }
      },

      clearWatchlist: () => {
        set({ productIds: [] });
      },
    }),
    {
      name: "watchlist-storage",
    },
  ),
);

// Selector for watchlist count
export const useWatchlistCount = () =>
  useWatchlistStore((state) => state.productIds.length);
