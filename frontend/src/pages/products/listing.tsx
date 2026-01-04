import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ProductFilters,
  ProductListContent,
  ProductListHeader,
  ProductSortControls,
} from "@/components/products/listing";
import { ProductListBreadcrumb } from "@/components/products/listing/product-list-breadcrumb";
import type { Category } from "@/types";

export function ProductListingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // Get filter values from URL
  const sortBy = searchParams.get("sort") || "ending_asc";
  const categorySlug = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;

  // Callback to receive selected category from ProductFilters
  const handleCategorySelect = useCallback((category: Category | null) => {
    setSelectedCategory(category);
  }, []);

  const handleSortChange = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        prev.set("sort", value);
        prev.set("page", "1");
        return prev;
      });
    },
    [setSearchParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        prev.set("page", page.toString());
        return prev;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams],
  );

  const handleCategoryClick = useCallback(
    (slug: string) => {
      navigate(`/products?category=${slug}&page=1`);
      setShowFilters(false);
    },
    [navigate],
  );

  const handlePriceChange = useCallback(
    (type: "min" | "max", value: string) => {
      setSearchParams((prev) => {
        if (value) {
          prev.set(type === "min" ? "minPrice" : "maxPrice", value);
        } else {
          prev.delete(type === "min" ? "minPrice" : "maxPrice");
        }
        prev.set("page", "1");
        return prev;
      });
    },
    [setSearchParams],
  );

  const hasActiveFilters = !!(selectedCategory || minPrice || maxPrice);
  const clearFilters = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  const handleTotalCountChange = useCallback((count: number) => {
    setTotalCount(count);
  }, []);

  return (
    <div className="container-app">
      <ProductListBreadcrumb
        currentCategory={selectedCategory}
        searchQuery={searchQuery}
      />

      <div className="flex items-center justify-between">
        <ProductListHeader
          currentCategory={selectedCategory}
          searchQuery={searchQuery}
          totalCount={totalCount}
        />

        <ProductSortControls
          sortBy={sortBy}
          viewMode={viewMode}
          hasActiveFilters={hasActiveFilters}
          onSortChange={handleSortChange}
          onViewModeChange={setViewMode}
          clearFilters={clearFilters}
        />
      </div>

      <div className="flex gap-6">
        <ProductFilters
          currentCategory={selectedCategory}
          categorySlug={categorySlug}
          minPrice={minPrice}
          maxPrice={maxPrice}
          showFilters={showFilters}
          onCategoryClick={handleCategoryClick}
          onCategorySelect={handleCategorySelect}
          onPriceChange={handlePriceChange}
          onClose={() => setShowFilters(false)}
        />

        {/* Products Grid/List */}
        <ProductListContent
          sortBy={sortBy}
          categorySlug={categorySlug}
          searchQuery={searchQuery}
          minPrice={minPrice}
          maxPrice={maxPrice}
          viewMode={viewMode}
          onPageChange={handlePageChange}
          onTotalCountChange={handleTotalCountChange}
        />
      </div>
    </div>
  );
}

// Legacy export for backwards compatibility
export const SearchPage = ProductListingPage;
