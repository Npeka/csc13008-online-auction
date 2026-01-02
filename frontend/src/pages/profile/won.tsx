import { useState } from "react";
import { Link } from "react-router";
import { Star, Trophy } from "lucide-react";
import { RatingModal } from "@/components/shared/rating-modal";
import { Button } from "@/components/ui/button";
import { mockProducts } from "@/data/mock";
import { formatUSD } from "@/lib/utils";
import type { Product } from "@/types";

export function WonPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [ratedProducts, setRatedProducts] = useState<Set<string>>(new Set());

  // Mock won products
  const wonProducts = mockProducts.slice(0, 2);

  const handleRateClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleRatingSubmit = async () => {
    if (selectedProduct) {
      setRatedProducts((prev) => new Set([...prev, selectedProduct.id]));
    }
  };

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
          <Link to="/products">
            <Button>Browse Auctions</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {wonProducts.map((product) => {
            const isRated = ratedProducts.has(product.id);

            return (
              <div
                key={product.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-bg-card p-4 sm:flex-row sm:items-center"
              >
                {/* Product Image */}
                <Link to={`/products/${product.id}`} className="shrink-0">
                  <img
                    src={
                      typeof product.images[0] === "string"
                        ? product.images[0]
                        : product.images[0]?.url
                    }
                    alt={product.name}
                    className="h-24 w-24 rounded-lg object-cover sm:h-20 sm:w-20"
                  />
                </Link>

                {/* Product Info */}
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/products/${product.id}`}
                    className="line-clamp-2 font-medium text-text hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                    <span>
                      Won for:{" "}
                      <strong className="text-success">
                        {formatUSD(product.currentPrice)}
                      </strong>
                    </span>
                    <span>Seller: {product.seller?.name}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:shrink-0">
                  {isRated ? (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
                      <Star className="h-4 w-4 fill-current" />
                      Rated
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRateClick(product)}
                    >
                      <Star className="mr-1.5 h-4 w-4" />
                      Rate Seller
                    </Button>
                  )}
                  <Link to={`/products/${product.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {selectedProduct && (
        <RatingModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          seller={selectedProduct.seller as any}
          product={selectedProduct}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
}
