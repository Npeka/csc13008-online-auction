import { memo } from "react";
import type { Category } from "@/types";

interface ProductListHeaderProps {
  currentCategory: Category | null;
  searchQuery: string;
  totalCount: number;
}

export const ProductListHeader = memo(function ProductListHeader({
  currentCategory,
  searchQuery,
  totalCount,
}: ProductListHeaderProps) {
  const title =
    currentCategory?.name ||
    (searchQuery ? `Results for "${searchQuery}"` : "All Products");

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-text">{title}</h1>
      <p className="text-text-muted">
        {totalCount} product{totalCount !== 1 ? "s" : ""} found
      </p>
    </div>
  );
});
