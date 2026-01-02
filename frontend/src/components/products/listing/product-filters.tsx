import { memo, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { useCategoryStore } from "@/stores/category-store";

interface ProductFiltersProps {
  currentCategory: Category | null;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  showFilters: boolean;
  onCategoryClick: (categorySlug: string) => void;
  onCategorySelect: (category: Category | null) => void;
  onPriceChange: (type: "min" | "max", value: string) => void;
  onClose: () => void;
}

export const ProductFilters = memo(function ProductFilters({
  currentCategory,
  categorySlug,
  minPrice,
  maxPrice,
  showFilters,
  onCategoryClick,
  onCategorySelect,
  onPriceChange,
  onClose,
}: ProductFiltersProps) {
  const { categories, findBySlug, isLoaded } = useCategoryStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // Find and notify parent of current category when categorySlug changes
  useEffect(() => {
    if (!categorySlug) {
      onCategorySelect(null);
      return;
    }

    const category = findBySlug(categorySlug);
    if (category) {
      onCategorySelect(category);

      // If this is a child category, expand its parent
      if (category.parentId) {
        setExpandedCategories((prev) => {
          const newSet = new Set(prev);
          newSet.add(category.parentId!);
          return newSet;
        });
      }
    }
  }, [categorySlug, findBySlug, onCategorySelect, isLoaded]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
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
        onClick={onClose}
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
          <button onClick={onClose} className="cursor-pointer p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="mb-6 rounded-xl border border-border bg-bg-card p-4">
          <h3 className="mb-3 font-semibold text-text">Categories</h3>
          <ul className="space-y-1">
            {categories
              .filter((c) => !c.parentId)
              .map((cat) => {
                const isExpanded = expandedCategories.has(cat.id);
                const hasChildren = cat.children && cat.children.length > 0;

                return (
                  <li key={cat.id}>
                    {/* Parent Category */}
                    <div className="flex items-center gap-1">
                      {hasChildren && (
                        <button
                          onClick={() => toggleCategory(cat.id)}
                          className="cursor-pointer rounded p-1 hover:bg-bg-secondary"
                        >
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 text-text-muted transition-transform",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </button>
                      )}
                      <button
                        onClick={() => onCategoryClick(cat.slug)}
                        className={cn(
                          "flex-1 cursor-pointer rounded px-2 py-1.5 text-left text-sm transition-colors",
                          "flex items-center justify-between",
                          currentCategory?.id === cat.id
                            ? "bg-primary-light font-medium text-primary"
                            : "text-text hover:bg-bg-secondary",
                          !hasChildren && "ml-5",
                        )}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-text-muted">
                          {cat.productCount || 0}
                        </span>
                      </button>
                    </div>

                    {/* Subcategories */}
                    {hasChildren && isExpanded && (
                      <ul className="mt-1 ml-6 space-y-0.5 border-l border-border pl-2">
                        {cat.children?.map((subCat) => (
                          <li key={subCat.id}>
                            <button
                              onClick={() => onCategoryClick(subCat.slug)}
                              className={cn(
                                "w-full cursor-pointer rounded px-2 py-1 text-left text-xs transition-colors",
                                "flex items-center justify-between",
                                currentCategory?.id === subCat.id
                                  ? "bg-primary-light font-medium text-primary"
                                  : "text-text-secondary hover:bg-bg-secondary hover:text-text",
                              )}
                            >
                              <span>{subCat.name}</span>
                              <span className="text-xs text-text-muted">
                                {subCat.productCount || 0}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
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
              onChange={(e) => onPriceChange("min", e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text"
            />
            <span className="text-text-muted">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice || ""}
              onChange={(e) => onPriceChange("max", e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text"
            />
          </div>
        </div>
      </div>
    </aside>
  );
});
