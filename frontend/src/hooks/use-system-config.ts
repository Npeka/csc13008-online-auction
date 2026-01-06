import { useQuery } from "@tanstack/react-query";
import { systemApi, type AuctionConfig } from "@/lib";

const DEFAULT_CONFIG: AuctionConfig = {
  extensionTriggerTime: 5,
  extensionDuration: 10,
  newProductThreshold: 1440, // 24 hours default
};

/**
 * Hook to get system configuration values.
 * Returns cached values with sensible defaults.
 */
export function useSystemConfig() {
  const { data, isLoading } = useQuery({
    queryKey: ["system", "config", "auction"],
    queryFn: systemApi.getAuctionConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  return {
    config: data ?? DEFAULT_CONFIG,
    isLoading,
  };
}
