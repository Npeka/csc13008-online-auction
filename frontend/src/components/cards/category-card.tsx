import { Link } from "react-router";
import {
  Car,
  Home,
  Laptop,
  Package,
  Palette,
  Shirt,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  Laptop,
  Shirt,
  Trophy,
  Palette,
  Home,
  Car,
  Package,
};

export interface CategoryCardProps {
  category: Category;
  variant?: "default" | "compact" | "large";
  className?: string;
}

export function CategoryCard({
  category,
  variant = "default",
  className,
}: CategoryCardProps) {
  const IconComponent = iconMap[category.icon || "Package"] || Package;

  if (variant === "compact") {
    return (
      <Link
        to={`/products?category=${category.slug}`}
        className={cn(
          "flex items-center gap-3 rounded-lg p-3",
          "border border-border bg-bg-card",
          "cursor-pointer transition-all hover:border-primary/30 hover:bg-bg-secondary",
          className,
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-text">{category.name}</h4>
          <p className="text-xs text-text-muted">
            {category.productCount} items
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "large") {
    return (
      <Link
        to={`/products?category=${category.slug}`}
        className={cn(
          "block rounded-xl border border-border bg-bg-card p-6",
          "group cursor-pointer transition-all hover:border-primary hover:shadow-lg",
          className,
        )}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-primary to-cta/80 transition-transform group-hover:scale-110">
          <IconComponent className="h-8 w-8 text-white" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-text">
          {category.name}
        </h3>
        <p className="text-text-muted">{category.productCount} items</p>

        {category.children && category.children.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-xs text-text-muted">Subcategories</p>
            <div className="flex flex-wrap gap-1">
              {category.children.slice(0, 3).map((sub) => (
                <span
                  key={sub.id}
                  className="rounded-full bg-bg-secondary px-2 py-0.5 text-xs text-text-secondary"
                >
                  {sub.name}
                </span>
              ))}
              {category.children.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-text-muted">
                  +{category.children.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className={cn(
        "flex flex-col items-center rounded-xl p-4",
        "border border-border bg-bg-card",
        "group cursor-pointer transition-all hover:border-primary hover:shadow-md",
        className,
      )}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light transition-all group-hover:scale-105 group-hover:bg-primary">
        <IconComponent className="h-7 w-7 text-primary transition-colors group-hover:text-white" />
      </div>
      <h4 className="mb-1 text-center font-medium text-text">
        {category.name}
      </h4>
      <p className="text-sm text-text-muted">{category.productCount} items</p>
    </Link>
  );
}

// Category Grid
export function CategoryGrid({
  categories,
  variant = "default",
  className,
}: {
  categories: Category[];
  variant?: "default" | "compact" | "large";
  className?: string;
}) {
  const gridClasses = {
    default: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
    compact: "grid-cols-1 sm:grid-cols-2",
    large: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={cn("grid gap-4", gridClasses[variant], className)}>
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} variant={variant} />
      ))}
    </div>
  );
}
