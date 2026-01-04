// Re-export all API services
export { apiClient as default } from "./api-client";
export { authApi } from "./auth-api";
export { bidsApi } from "./bids-api";
export { categoriesApi } from "./categories-api";
export { productsApi } from "./products-api";
export { questionsApi } from "./questions-api";
export { usersApi } from "./users-api";

// Export types
export type { AuthResponse, LoginData, RegisterData } from "./auth-api";
export type { MaskedBid } from "./bids-api";
export type { CreateCategoryData } from "./categories-api";
export type { CreateProductData, ProductListResponse } from "./products-api";
export type {
  RatingSummary,
  UpdateProfileData,
  UpgradeRequest,
} from "./users-api";
