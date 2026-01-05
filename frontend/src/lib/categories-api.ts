import type { Category } from "@/types";
import apiClient from "./api-client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
}

export const categoriesApi = {
  // Get all categories (with hierarchy and product counts)
  getCategories: async (includeProducts = true): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      "/categories",
      {
        params: { includeProducts },
      },
    );
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(
      `/categories/${slug}`,
    );
    return response.data;
  },

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      "/categories",
      data,
    );
    return response.data;
  },

  updateCategory: async (
    categoryId: string,
    data: Partial<CreateCategoryData>,
  ): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(
      `/categories/${categoryId}`,
      data,
    );
    return response.data;
  },

  deleteCategory: async (categoryId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/categories/${categoryId}`,
    );
    return { message: response.message || "Success" };
  },
};
