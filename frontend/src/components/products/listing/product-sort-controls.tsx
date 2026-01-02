import { memo } from "react";
import { Grid, List, X } from "lucide-react";
import { Select } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sortOptions = [
  { label: "Ending Soon", value: "ending_asc" },
  { label: "Ending Latest", value: "ending_desc" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Bids", value: "most_bids" },
  { label: "Newest First", value: "newest" },
];

interface ProductSortControlsProps {
  sortBy: string;
  viewMode: "grid" | "list";
  hasActiveFilters?: boolean;
  onSortChange: (value: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  clearFilters?: () => void;
}

export const ProductSortControls = memo(function ProductSortControls({
  sortBy,
  viewMode,
  hasActiveFilters,
  onSortChange,
  onViewModeChange,
  clearFilters,
}: ProductSortControlsProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            className="min-w-max gap-2"
            variant="ghost"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}

        {/* Sort Dropdown */}
        <Select
          value={sortBy}
          onChange={onSortChange}
          options={sortOptions}
          className="w-48"
        />

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-border">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-lg transition-colors",
              viewMode === "grid"
                ? "bg-primary text-white"
                : "hover:bg-bg-secondary",
            )}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex h-10 w-10 cursor-pointer items-center justify-center rounded-r-lg transition-colors",
              viewMode === "list"
                ? "bg-primary text-white"
                : "hover:bg-bg-secondary",
            )}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters button for mobile */}
      <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-bg-secondary lg:hidden">
        <span>Filters</span>
      </button>
    </div>
  );
});
