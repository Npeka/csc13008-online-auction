import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ProductPagination = memo(function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(-2);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="mt-12 flex justify-center">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors",
            currentPage === 1
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-bg-secondary",
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {renderPageNumbers().map((page, idx) => {
          if (page === -1 || page === -2) {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-text-muted">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "h-10 min-w-10 cursor-pointer rounded-lg border px-3 transition-colors",
                page === currentPage
                  ? "border-primary bg-primary text-white"
                  : "border-border hover:bg-bg-secondary",
              )}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors",
            currentPage === totalPages
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-bg-secondary",
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
});
