import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Gavel } from "lucide-react";
import { ProductGrid } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { bidsApi } from "@/lib";
import type { Product } from "@/types";

export function BidsPage() {
  const [activeBids, setActiveBids] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setIsLoading(true);
        const data = await bidsApi.getMyBiddingProducts();
        setActiveBids(data);
      } catch (error) {
        console.error("Failed to fetch bids:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBids();
  }, []);

  if (isLoading) {
    return (
      <div className="container-app flex min-h-screen items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="mb-8 text-2xl font-bold text-text">Active Bids</h1>

      {activeBids.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card py-20 text-center">
          <Gavel className="mx-auto mb-4 h-16 w-16 text-text-muted" />
          <h2 className="mb-2 text-xl font-semibold text-text">
            No active bids
          </h2>
          <p className="mb-6 text-text-muted">
            You haven't placed any bids yet.
          </p>
          <Link to="/products">
            <Button>Start Bidding</Button>
          </Link>
        </div>
      ) : (
        <ProductGrid products={activeBids} columns={3} />
      )}
    </div>
  );
}
