import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockCategories } from "@/data/mock";
import type { Category } from "@/types";

export interface MegaMenuProps {
  className?: string;
}

export function MegaMenu({ className }: MegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <nav
      ref={menuRef}
      className={cn("relative", className)}
      onMouseLeave={handleMouseLeave}
    >
      <ul className="flex items-center gap-1">
        {mockCategories.map((category) => (
          <li
            key={category.id}
            onMouseEnter={() => handleMouseEnter(category.id)}
          >
            <Link
              to={`/category/${category.id}`}
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
            category={mockCategories.find((c) => c.id === activeCategory)!}
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
          to={`/category/${category.id}`}
          className="text-sm text-primary hover:underline"
        >
          View all {category.productCount} items →
        </Link>
      </div>

      {category.children && category.children.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {category.children.map((subCategory) => (
            <Link
              key={subCategory.id}
              to={`/category/${subCategory.id}`}
              className={cn(
                "flex items-center justify-between rounded-lg p-3",
                "group cursor-pointer transition-colors hover:bg-bg-secondary",
              )}
            >
              <span className="font-medium text-text transition-colors group-hover:text-primary">
                {subCategory.name}
              </span>
              <span className="text-sm text-text-muted">
                {subCategory.productCount}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile Menu
export function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
          <ul className="space-y-1">
            {mockCategories.map((category) => (
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
                  {category.children && (
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
                          to={`/category/${sub.id}`}
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
        </nav>
      </div>
    </div>
  );
}
