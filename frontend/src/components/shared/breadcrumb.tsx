import { Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link
            to="/"
            className="flex items-center text-text-muted transition-colors hover:text-primary"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-text-muted" />
            {item.href && index < items.length - 1 ? (
              <Link
                to={item.href}
                className="text-text-muted transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-text">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Category Breadcrumb - For product pages
export function CategoryBreadcrumb({
  category,
  subCategory,
  className,
}: {
  category: { id: string; name: string };
  subCategory?: { id: string; name: string };
  className?: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: category.name, href: `/category/${category.id}` },
  ];

  if (subCategory) {
    items.push({
      label: subCategory.name,
      href: `/category/${subCategory.id}`,
    });
  }

  return <Breadcrumb items={items} className={className} />;
}
