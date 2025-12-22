import { Link } from "react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/cards/product-card";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { mockProducts } from "@/data/mock";

export function WatchlistPage() {
  const { productIds } = useWatchlistStore();
  const watchlistProducts = mockProducts.filter((p) =>
    productIds.includes(p.id),
  );

  return (
    <div className="container-app py-10">
      <h1 className="mb-8 text-2xl font-bold text-text">My Watchlist</h1>

      {watchlistProducts.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card py-20 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-text-muted" />
          <h2 className="mb-2 text-xl font-semibold text-text">
            Your watchlist is empty
          </h2>
          <p className="mb-6 text-text-muted">
            Add items to your watchlist to track their auctions.
          </p>
          <Link to="/search">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <ProductGrid products={watchlistProducts} columns={4} />
      )}
    </div>
  );
}
