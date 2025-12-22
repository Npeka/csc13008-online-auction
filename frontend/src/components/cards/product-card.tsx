import { Link } from "react-router";
import { Heart, Users } from "lucide-react";
import { cn, formatUSD, maskName, isNewProduct } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CountdownBadge } from "@/components/shared/countdown";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { Product } from "@/types";

export interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "horizontal";
  className?: string;
}

export function ProductCard({
  product,
  variant = "default",
  className,
}: ProductCardProps) {
  const { productIds, toggleWatchlist } = useWatchlistStore();
  const inWatchlist = productIds.includes(product.id);
  const isNew = product.isNew || isNewProduct(product.createdAt);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(product.id);
  };

  if (variant === "horizontal") {
    return (
      <Link
        to={`/product/${product.id}`}
        className={cn(
          "flex gap-4 rounded-xl border border-border bg-bg-card p-4",
          "cursor-pointer transition-all hover:border-primary/30 hover:shadow-md",
          className,
        )}
      >
        {/* Image */}
        <div className="relative h-32 w-32 shrink-0">
          <img
            src={product.images[0]?.url}
            alt={product.name}
            className="h-full w-full rounded-lg object-cover"
          />
          {isNew && (
            <Badge variant="new" className="absolute top-2 left-2">
              NEW
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="mb-2 line-clamp-2 font-semibold text-text">
            {product.name}
          </h3>

          <div className="mb-2 flex items-center gap-2 text-sm text-text-muted">
            <span>{product.category.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {product.bidCount} bids
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Current Bid</p>
              <p className="text-lg font-bold text-primary">
                {formatUSD(product.currentPrice)}
              </p>
            </div>
            <CountdownBadge endTime={product.endTime} />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={`/product/${product.id}`}
        className={cn(
          "block rounded-lg border border-border bg-bg-card p-3",
          "cursor-pointer transition-all hover:border-primary/30",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <img
            src={product.images[0]?.url}
            alt={product.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-1 text-sm font-medium text-text">
              {product.name}
            </h4>
            <p className="mt-1 text-sm font-bold text-primary">
              {formatUSD(product.currentPrice)}
            </p>
          </div>
          <CountdownBadge endTime={product.endTime} />
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        "group block overflow-hidden rounded-xl border border-border bg-bg-card",
        "cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg",
        "card-hover",
        className,
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={product.images[0]?.url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && <Badge variant="new">NEW</Badge>}
          {product.isFeatured && <Badge variant="warning">Featured</Badge>}
        </div>

        {/* Watchlist button */}
        <button
          onClick={handleWatchlistClick}
          className={cn(
            "absolute top-3 right-3 cursor-pointer rounded-full p-2 transition-all",
            inWatchlist
              ? "bg-cta text-white"
              : "bg-black/40 text-white hover:bg-cta",
          )}
        >
          <Heart className={cn("h-4 w-4", inWatchlist && "fill-current")} />
        </button>

        {/* Countdown overlay */}
        <div className="absolute bottom-3 left-3">
          <CountdownBadge endTime={product.endTime} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="mb-1 text-xs font-medium text-primary">
          {product.category.name}
        </p>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 font-semibold text-text transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        {/* Price and Bids */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-text-muted">Current Bid</p>
            <p className="text-xl font-bold text-text">
              {formatUSD(product.currentPrice)}
            </p>
          </div>

          {product.buyNowPrice && (
            <div className="text-right">
              <p className="text-xs text-text-muted">Buy Now</p>
              <p className="text-sm font-semibold text-cta">
                {formatUSD(product.buyNowPrice)}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {product.bidCount} bids
          </div>

          {product.highestBidder && (
            <div className="flex items-center gap-1">
              <Avatar
                src={product.highestBidder.avatar}
                fallback={product.highestBidder.fullName}
                size="xs"
              />
              <span>{maskName(product.highestBidder.fullName)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Product Grid Component
export function ProductGrid({
  products,
  columns = 4,
  className,
}: {
  products: Product[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
