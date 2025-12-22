import { Link } from "react-router";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/cards/product-card";
import { mockProducts } from "@/data/mock";

export function WonPage() {
  const wonProducts = mockProducts.slice(0, 2);

  return (
    <div className="container-app py-10">
      <h1 className="mb-8 text-2xl font-bold text-text">Won Auctions</h1>

      {wonProducts.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card py-20 text-center">
          <Trophy className="mx-auto mb-4 h-16 w-16 text-text-muted" />
          <h2 className="mb-2 text-xl font-semibold text-text">
            No won auctions
          </h2>
          <p className="mb-6 text-text-muted">
            You haven't won any auctions yet.
          </p>
          <Link to="/search">
            <Button>Browse Auctions</Button>
          </Link>
        </div>
      ) : (
        <ProductGrid products={wonProducts} columns={3} />
      )}
    </div>
  );
}
