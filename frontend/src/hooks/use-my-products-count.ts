import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Hook to get the count of user's products (for header badge)
 * Works for both sellers and ex-sellers (buyers who had products)
 */
export function useMyProductsCount(): number {
  const { isAuthenticated, user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["my-products-count"],
    queryFn: productsApi.getMyProductsCount,
    enabled: isAuthenticated && !!user, // Only fetch if authenticated AND user exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on 401 errors
  });

  return data || 0;
}

