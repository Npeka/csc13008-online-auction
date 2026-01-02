import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";
import { categoriesApi } from "@/lib";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

// Mobile Menu
export function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getCategories(true);
        // Filter to get only parent categories (those without parentId)
        const parentCategories = data.filter((cat) => !cat.parentId);
        setCategories(parentCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="z-modal fixed inset-0 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Menu Panel */}
      <div className="animate-in slide-in-from-left absolute top-0 bottom-0 left-0 w-80 bg-bg-card duration-300">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-text">Categories</h2>
        </div>

        <nav className="h-full overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-lg bg-bg-secondary"
                />
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === category.id ? null : category.id,
                      )
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2",
                      "cursor-pointer text-left font-medium transition-colors",
                      expandedCategory === category.id
                        ? "bg-primary-light text-primary"
                        : "text-text hover:bg-bg-secondary",
                    )}
                  >
                    {category.name}
                    {category.children && category.children.length > 0 && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedCategory === category.id && "rotate-180",
                        )}
                      />
                    )}
                  </button>

                  {/* Subcategories */}
                  {expandedCategory === category.id && category.children && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {category.children.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            to={`/products?category=${sub.slug}`}
                            onClick={onClose}
                            className="block px-3 py-2 text-sm text-text-secondary transition-colors hover:text-primary"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>
    </div>
  );
}
