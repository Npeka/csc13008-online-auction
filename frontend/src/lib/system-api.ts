import apiClient from "./api-client";

export interface AuctionConfig {
  extensionTriggerTime: number;
  extensionDuration: number;
}

export const systemApi = {
  // Get auction auto-extension config
  getAuctionConfig: async (): Promise<AuctionConfig> => {
    return apiClient.get<AuctionConfig>("/system/config/auction");
  },

  // Update auction auto-extension config (Admin only)
  updateAuctionConfig: async (
    data: AuctionConfig,
  ): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>("/system/config/auction", data);
  },
};
