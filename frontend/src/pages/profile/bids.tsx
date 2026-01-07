import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Crown, Gavel, Users } from "lucide-react";
import { CountdownBadge } from "@/components/shared/countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bidsApi } from "@/lib";
import { cn, formatUSD } from "@/lib/utils";
import type { Product } from "@/types";

interface BiddingProduct extends Product {
  isHighestBidder: boolean;
  currentBid: number;
}

export function BidsPage() {
  const [activeBids, setActiveBids] = useState<BiddingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setIsLoading(true);
        const data = await bidsApi.getMyBiddingProducts();
        // Show active auctions AND ended auctions where user lost (not winning)
        const filteredBids = data.filter(
          (product: BiddingProduct) =>
            product.status === "ACTIVE" ||
            (product.status === "ENDED" && !product.isHighestBidder),
        );
        setActiveBids(filteredBids);
      } catch (error) {
        console.error("Failed to fetch bids:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBids();
  }, []);

  const getImageUrl = (image: string | { url: string } | undefined) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.url;
  };

  if (isLoading) {
    return (
      <div className="container-app flex min-h-screen items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-text">My Bids</h1>
        <p className="text-text-muted">
          Track your current bids on active auctions and past lost bids
        </p>
      </div>

      {activeBids.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card py-20 text-center">
          <Gavel className="mx-auto mb-4 h-16 w-16 text-text-muted" />
          <h2 className="mb-2 text-xl font-semibold text-text">No bids yet</h2>
          <p className="mb-6 text-text-muted">
            You haven't placed any bids yet.
          </p>
          <Link to="/products">
            <Button>Start Bidding</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activeBids.map((product) => {
            const imageUrl = getImageUrl(product.images[0]);
            const isActive = product.status === "ACTIVE";
            const isWinning = product.isHighestBidder;

            return (
              <div
                key={product.id}
                className={cn(
                  "flex gap-4 rounded-xl border border-border bg-bg-card p-4",
                  "transition-all hover:border-primary/30 hover:shadow-md",
                  isActive && isWinning && "border-success bg-success/5",
                  !isActive && "opacity-75",
                )}
              >
                {/* Image */}
                <Link to={`/products/${product.slug}`} className="shrink-0">
                  <div className="relative h-32 w-32">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    {isActive && isWinning && (
                      <Badge
                        variant="success"
                        className="absolute top-2 left-2"
                      >
                        <Crown className="mr-1 h-3 w-3" />
                        Winning
                      </Badge>
                    )}
                    {!isActive && (
                      <Badge variant="error" className="absolute top-2 left-2">
                        Lost
                      </Badge>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <Link
                  to={`/products/${product.slug}`}
                  className="min-w-0 flex-1"
                >
                  <h3 className="mb-2 line-clamp-2 font-semibold text-text hover:text-primary">
                    {product.title || product.name}
                  </h3>

                  <div className="mb-2 flex items-center gap-2 text-sm text-text-muted">
                    <span>{product.category?.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {product.bidCount} bids
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-muted">Current Price</p>
                      <p className="text-lg font-bold text-primary">
                        {formatUSD(product.currentPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Your Bid</p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          isActive && isWinning ? "text-success" : "text-text",
                        )}
                      >
                        {formatUSD(product.currentBid)}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Right Column: Countdown + View Button */}
                <div className="flex shrink-0 flex-col items-end justify-between">
                  {isActive ? (
                    <CountdownBadge endTime={product.endTime} />
                  ) : (
                    <Badge variant="default">Ended</Badge>
                  )}
                  <Link to={`/products/${product.slug}`}>
                    <button
                      className={cn(
                        "cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        "border border-border bg-bg-secondary text-text hover:border-primary hover:bg-primary hover:text-white",
                      )}
                    >
                      View
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
