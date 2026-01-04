import { memo } from "react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Category } from "@/types";

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

  return <Breadcrumb items={breadcrumbItems} className="my-4" />;
});
