import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategoryStore } from "@/stores/category-store";
import type { Category } from "@/types";

export interface MegaMenuProps {
  className?: string;
}

export function MegaMenu({ className }: MegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { categories, isLoading, fetchCategories } = useCategoryStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <nav className={cn("relative", className)}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 animate-pulse rounded bg-bg-secondary" />
          <div className="h-8 w-24 animate-pulse rounded bg-bg-secondary" />
          <div className="h-8 w-24 animate-pulse rounded bg-bg-secondary" />
        </div>
      </nav>
    );
  }

  return (
    <nav
      ref={menuRef}
      className={cn("relative", className)}
      onMouseLeave={handleMouseLeave}
    >
      <ul className="flex items-center gap-1">
        {categories.map((category) => (
          <li
            key={category.id}
            onMouseEnter={() => handleMouseEnter(category.id)}
          >
            <Link
              to={`/products?category=${category.slug}`}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium",
                "cursor-pointer transition-colors",
                activeCategory === category.id
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text",
              )}
            >
              {category.name}
              {category.children && category.children.length > 0 && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    activeCategory === category.id && "rotate-180",
                  )}
                />
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* Dropdown Panel */}
      {activeCategory && (
        <div
          className={cn(
            "absolute top-full left-0 mt-2 min-w-[600px]",
            "rounded-xl border border-border bg-bg-card shadow-xl",
            "animate-in fade-in slide-in-from-top-2 duration-200",
            "z-dropdown p-6",
          )}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
        >
          <MegaMenuPanel
            category={categories.find((c) => c.id === activeCategory)!}
          />
        </div>
      )}
    </nav>
  );
}

function MegaMenuPanel({ category }: { category: Category }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-lg font-semibold text-text">{category.name}</h3>
        <Link
          to={`/products?category=${category.slug}`}
          className="text-sm text-primary hover:underline"
        >
          View all {category.productCount || 0} items →
        </Link>
      </div>

      {category.children && category.children.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {category.children.map((subCategory) => (
            <Link
              key={subCategory.id}
              to={`/products?category=${subCategory.slug}`}
              className={cn(
                "flex items-center justify-between rounded-lg p-3",
                "group cursor-pointer transition-colors hover:bg-bg-secondary",
              )}
            >
              <span className="font-medium text-text transition-colors group-hover:text-primary">
                {subCategory.name}
              </span>
              <span className="text-sm text-text-muted">
                {subCategory.productCount || 0}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
