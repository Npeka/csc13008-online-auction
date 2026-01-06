import type { PaginationMeta, Product, ProductFilters } from "@/types";
import apiClient from "./api-client";

export interface CreateProductData {
  title: string;
  description: string;
  images: string[];
  categoryId: string;
  startPrice: number;
  bidStep: number;
  buyNowPrice?: number;
  endTime: string;
  autoExtend?: boolean;
  extensionTriggerTime?: number; // minutes before end to trigger
  extensionDuration?: number; // minutes to extend
  allowNewBidders?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export const productsApi = {
  // List products with filters
  getProducts: async (
    filters?: ProductFilters,
  ): Promise<ProductListResponse> => {
    return await apiClient.get<ProductListResponse>("/products", {
      params: filters,
    });
  },

  // Get products ending soon
  getEndingSoon: async (limit = 5): Promise<Product[]> => {
    return await apiClient.get("/products/ending-soon", {
      params: { limit },
    });
  },

  // Get products with most bids
  getMostBids: async (limit = 5): Promise<Product[]> => {
    return await apiClient.get("/products/most-bids", {
      params: { limit },
    });
  },

  // Get products with highest prices
  getHighestPrice: async (limit = 5): Promise<Product[]> => {
    return await apiClient.get("/products/highest-price", {
      params: { limit },
    });
  },

  // Get product by slug
  getProductBySlug: async (
    slug: string,
  ): Promise<Product & { relatedProducts: Product[] }> => {
    return await apiClient.get(`/products/${slug}`);
  },

  // Get product by ID (for editing/appending)
  getProductById: async (id: string): Promise<Product> => {
    return await apiClient.get(`/products/${id}`);
  },

  // Get my products (seller)
  getMyProducts: async (
    status?: "active" | "ended",
    page?: number,
    limit?: number,
  ): Promise<Product[] | ProductListResponse> => {
    const params: any = { status };
    if (page) params.page = page;
    if (limit) params.limit = limit;

    return await apiClient.get("/products/my-products", { params });
  },

  // Get my products count (for header badge)
  getMyProductsCount: async (): Promise<number> => {
    return await apiClient.get("/products/my-products-count");
  },

  // Create product (seller/admin)
  createProduct: async (data: CreateProductData): Promise<Product> => {
    return await apiClient.post("/products", data);
  },

  // Update product (seller/admin)
  updateProduct: async (
    productId: string,
    data: Partial<CreateProductData>,
  ): Promise<Product> => {
    return await apiClient.patch(`/products/${productId}`, data);
  },

  // Append description (seller/admin)
  appendDescription: async (
    productId: string,
    additionalDescription: string,
  ): Promise<Product> => {
    return await apiClient.patch(`/products/${productId}/description`, {
      additionalDescription,
    });
  },

  // Delete product (admin)
  deleteProduct: async (productId: string): Promise<{ message: string }> => {
    return await apiClient.delete(`/products/${productId}`);
  },
};
