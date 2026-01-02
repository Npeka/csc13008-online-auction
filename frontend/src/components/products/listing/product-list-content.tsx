import { memo, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ProductCard, ProductGrid } from "@/components/cards/product-card";
import { ProductPagination } from "./product-pagination";
import { productsApi } from "@/lib";
import { useCategoryStore } from "@/stores/category-store";
import type { Product, ProductFilters as ProductFiltersType } from "@/types";

const ITEMS_PER_PAGE = 6;

interface ProductListContentProps {
  viewMode: "grid" | "list";
  sortBy: string;
  minPrice?: number;
  maxPrice?: number;
  categorySlug?: string;
  searchQuery?: string;
  onPageChange: (page: number) => void;
  onTotalCountChange?: (count: number) => void;
}

export const ProductListContent = memo(function ProductListContent({
  viewMode,
  sortBy,
  minPrice,
  maxPrice,
  categorySlug,
  searchQuery,
  onPageChange,
  onTotalCountChange,
}: ProductListContentProps) {
  const [searchParams] = useSearchParams();
  const { findBySlug } = useCategoryStore();

  const { isLoaded: isLoadedCategories } = useCategoryStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(!isLoadedCategories);
  const [totalCount, setTotalCount] = useState(0);

  // Get filter values from URL
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Resolve category slug to ID using store
        let categoryId: string | undefined;
        if (categorySlug) {
          const category = findBySlug(categorySlug);
          categoryId = category?.id;
        }

        // Build filter params
        const filters: ProductFiltersType = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sortBy: sortBy as ProductFiltersType["sortBy"],
        };

        if (categoryId) {
          filters.categoryId = categoryId;
        }

        if (searchQuery) filters.search = searchQuery;
        if (minPrice) filters.minPrice = minPrice;
        if (maxPrice) filters.maxPrice = maxPrice;

        // Fetch products
        const response = await productsApi.getProducts(filters);
        setProducts(response.products);
        setTotalCount(response.pagination.total);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    categorySlug,
    currentPage,
    sortBy,
    minPrice,
    maxPrice,
    searchQuery,
    findBySlug,
    isLoadedCategories,
  ]);

  // Notify parent of total count changes
  useEffect(() => {
    onTotalCountChange?.(totalCount);
  }, [totalCount, onTotalCountChange]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="flex items-center justify-center rounded-xl border border-border bg-bg-card py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {products.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card py-16 text-center">
          <p className="text-text-muted">No products found</p>
        </div>
      ) : viewMode === "grid" ? (
        <ProductGrid products={products} columns={3} />
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="horizontal"
            />
          ))}
        </div>
      )}

      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
});
