import { memo } from "react";
import type { Category } from "@/types";
import { Breadcrumb } from "@/components/shared/breadcrumb";

interface ProductListBreadcrumbProps {
  currentCategory: Category | null;
  searchQuery: string;
}

export const ProductListBreadcrumb = memo(function ProductListBreadcrumb({
  currentCategory,
  searchQuery,
}: ProductListBreadcrumbProps) {
  const breadcrumbItems = currentCategory
    ? [{ label: currentCategory.name }]
    : searchQuery
      ? [{ label: `Search: "${searchQuery}"` }]
      : [{ label: "All Products" }];

  return <Breadcrumb items={breadcrumbItems} className="mb-8" />;
});
