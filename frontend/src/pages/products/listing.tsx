import { useState, useMemo } from "react";
import { useSearchParams, useParams } from "react-router";
import { Grid, List, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/dropdown";
import { ProductCard, ProductGrid } from "@/components/cards/product-card";
import { Pagination } from "@/components/shared/pagination";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { mockProducts, mockCategories, getCategoryById } from "@/data/mock";

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { label: "Ending Soon", value: "ending_asc" },
  { label: "Ending Latest", value: "ending_desc" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Bids", value: "most_bids" },
  { label: "Newest First", value: "newest" },
];

export function ProductListingPage() {
  const { id: categoryId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Get filter values from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sort") || "ending_asc";
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const searchQuery = searchParams.get("q") || "";

  const category = categoryId ? getCategoryById(categoryId) : undefined;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    // Filter by category
    if (categoryId) {
      products = products.filter((p) => {
        // Check if matches category or subcategory
        if (p.categoryId === categoryId) return true;
        const cat = getCategoryById(categoryId);
        if (cat?.children?.some((c) => c.id === p.categoryId)) return true;
        return false;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.name.toLowerCase().includes(query),
      );
    }

    // Filter by price
    if (minPrice !== undefined) {
      products = products.filter((p) => p.currentPrice >= minPrice);
    }
    if (maxPrice !== undefined) {
      products = products.filter((p) => p.currentPrice <= maxPrice);
    }

    // Sort
    switch (sortBy) {
      case "ending_asc":
        products.sort(
          (a, b) =>
            new Date(a.endTime).getTime() - new Date(b.endTime).getTime(),
        );
        break;
      case "ending_desc":
        products.sort(
          (a, b) =>
            new Date(b.endTime).getTime() - new Date(a.endTime).getTime(),
        );
        break;
      case "price_asc":
        products.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case "price_desc":
        products.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "most_bids":
        products.sort((a, b) => b.bidCount - a.bidCount);
        break;
      case "newest":
        products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return products;
  }, [categoryId, searchQuery, minPrice, maxPrice, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSortChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set("sort", value);
      prev.set("page", "1");
      return prev;
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(page));
      return prev;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container-app py-10">
      {/* Breadcrumb */}
      <Breadcrumb
        items={
          category
            ? [{ label: category.name }]
            : searchQuery
              ? [{ label: `Search: "${searchQuery}"` }]
              : [{ label: "All Products" }]
        }
        className="mb-8"
      />

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {category?.name ||
              (searchQuery ? `Results for "${searchQuery}"` : "All Products")}
          </h1>
          <p className="text-text-muted">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={sortOptions}
            className="w-48"
          />

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-lg transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "hover:bg-bg-secondary",
              )}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex h-10 w-10 cursor-pointer items-center justify-center rounded-r-lg transition-colors",
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "hover:bg-bg-secondary",
              )}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <aside
          className={cn(
            "z-modal fixed inset-0 lg:relative lg:inset-auto lg:z-auto",
            "lg:w-64 lg:shrink-0",
            showFilters ? "block" : "hidden lg:block",
          )}
        >
          {/* Mobile backdrop */}
          <div
            className="absolute inset-0 bg-black/50 lg:hidden"
            onClick={() => setShowFilters(false)}
          />

          {/* Filter panel */}
          <div
            className={cn(
              "absolute top-0 right-0 bottom-0 w-80 overflow-y-auto bg-bg-card p-6",
              "lg:relative lg:w-full lg:bg-transparent lg:p-0",
            )}
          >
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6 rounded-xl border border-border bg-bg-card p-4">
              <h3 className="mb-3 font-semibold text-text">Categories</h3>
              <ul className="space-y-2">
                {mockCategories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setSearchParams((prev) => {
                          prev.delete("q");
                          prev.set("page", "1");
                          return prev;
                        });
                        window.location.href = `/category/${cat.id}`;
                      }}
                      className={cn(
                        "w-full cursor-pointer rounded px-2 py-1 text-left text-sm transition-colors",
                        categoryId === cat.id
                          ? "bg-primary-light font-medium text-primary"
                          : "text-text-secondary hover:text-text",
                      )}
                    >
                      {cat.name} ({cat.productCount})
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="mb-6 rounded-xl border border-border bg-bg-card p-4">
              <h3 className="mb-3 font-semibold text-text">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice || ""}
                  onChange={(e) => {
                    setSearchParams((prev) => {
                      if (e.target.value) {
                        prev.set("minPrice", e.target.value);
                      } else {
                        prev.delete("minPrice");
                      }
                      return prev;
                    });
                  }}
                  className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text"
                />
                <span className="text-text-muted">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice || ""}
                  onChange={(e) => {
                    setSearchParams((prev) => {
                      if (e.target.value) {
                        prev.set("maxPrice", e.target.value);
                      } else {
                        prev.delete("maxPrice");
                      }
                      return prev;
                    });
                  }}
                  className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear All Filters
            </Button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {paginatedProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mb-4 text-lg text-text-muted">No products found</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : viewMode === "grid" ? (
            <ProductGrid products={paginatedProducts} columns={3} />
          ) : (
            <div className="space-y-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="horizontal"
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SearchPage() {
  return <ProductListingPage />;
}
