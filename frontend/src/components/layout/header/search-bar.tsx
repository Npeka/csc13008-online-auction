import { useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  variant?: "desktop" | "mobile";
  onSearch?: () => void;
}

export function SearchBar({
  className,
  variant = "desktop",
  onSearch,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      onSearch?.();
    }
  };

  if (variant === "mobile") {
    return (
      <form onSubmit={handleSearch} className={className}>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className={cn(
              "w-full rounded-xl py-2.5 pr-4 pl-10",
              "border border-transparent bg-bg-secondary",
              "text-text placeholder:text-text-muted",
              "focus:border-primary focus:outline-none",
              "transition-colors",
            )}
          />
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className={cn("mx-4 hidden flex-1 md:flex", className)}
      style={{ maxWidth: "36rem" }}
    >
      <div className="relative w-full">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products, categories..."
          className={cn(
            "w-full rounded-xl py-2.5 pr-4 pl-10",
            "border border-transparent bg-bg-secondary",
            "text-text placeholder:text-text-muted",
            "focus:border-primary focus:bg-bg-card focus:outline-none",
            "transition-colors",
          )}
        />
      </div>
    </form>
  );
}
