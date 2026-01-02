import { create } from "zustand";
import { categoriesApi } from "@/lib";
import type { Category } from "@/types";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  isLoaded: boolean;
  fetchCategories: (includeProductCount?: boolean) => Promise<void>;
  findBySlug: (slug: string) => Category | undefined;
  findById: (id: string) => Category | undefined;
  clear: () => void;
}

// Recursive helper to find category by slug in nested structure
function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }
    if (category.children && category.children.length > 0) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) return found;
    }
  }
  return undefined;
}

// Recursive helper to find category by ID in nested structure
function findCategoryById(
  categories: Category[],
  id: string,
): Category | undefined {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children && category.children.length > 0) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export const useCategoryStore = create<CategoryState>()((set, get) => ({
  categories: [],
  isLoading: false,
  isLoaded: false,

  fetchCategories: async (includeProductCount = true) => {
    // Don't fetch if already loading or loaded
    const { isLoading, isLoaded } = get();
    if (isLoading || isLoaded) return;

    set({ isLoading: true });

    try {
      const data = await categoriesApi.getCategories(includeProductCount);
      set({
        categories: data.filter((c) => !c.parentId), // Only top-level
        isLoading: false,
        isLoaded: true,
      });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      set({ isLoading: false });
    }
  },

  findBySlug: (slug: string) => {
    const { categories } = get();
    return findCategoryBySlug(categories, slug);
  },

  findById: (id: string) => {
    const { categories } = get();
    return findCategoryById(categories, id);
  },

  clear: () => {
    set({ categories: [], isLoading: false, isLoaded: false });
  },
}));
