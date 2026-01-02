import { useEffect } from "react";
import { Link } from "react-router";
import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { useWatchlistStore } from "@/stores/watchlist-store";

export function WatchlistPage() {
  const { items, isLoading, fetchWatchlist } = useWatchlistStore();

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  if (isLoading) {
    return (
      <div className="container-app flex min-h-screen items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="mb-8 text-2xl font-bold text-text">My Watchlist</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card py-20 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-text-muted" />
          <h2 className="mb-2 text-xl font-semibold text-text">
            Your watchlist is empty
          </h2>
          <p className="mb-6 text-text-muted">
            Add items to your watchlist to track their auctions.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <ProductGrid products={items} columns={4} />
      )}
    </div>
  );
}
