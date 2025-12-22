import { Link } from "react-router";
import { Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/cards/product-card";
import { mockProducts } from "@/data/mock";

export function BidsPage() {
  const activeBids = mockProducts.slice(0, 3);

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
          <Link to="/search">
            <Button>Start Bidding</Button>
          </Link>
        </div>
      ) : (
        <ProductGrid products={activeBids} columns={3} />
      )}
    </div>
  );
}
