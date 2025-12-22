import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "cursor-pointer rounded-lg p-2 transition-colors",
          "hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* First page */}
      {showFirstLast && currentPage > 3 && totalPages > 5 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-secondary"
          >
            1
          </button>
          {currentPage > 4 && <span className="px-2 text-text-muted">...</span>}
        </>
      )}

      {/* Page numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-text-muted">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "min-w-[40px] cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-bg-secondary",
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Last page */}
      {showFirstLast && currentPage < totalPages - 2 && totalPages > 5 && (
        <>
          {currentPage < totalPages - 3 && (
            <span className="px-2 text-text-muted">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-secondary"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "cursor-pointer rounded-lg p-2 transition-colors",
          "hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}

// Items per page selector
export function ItemsPerPage({
  value,
  onChange,
  options = [12, 24, 48],
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="text-text-muted">Show:</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cursor-pointer rounded-lg border border-border bg-bg-card px-2 py-1 text-text"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-text-muted">per page</span>
    </div>
  );
}
