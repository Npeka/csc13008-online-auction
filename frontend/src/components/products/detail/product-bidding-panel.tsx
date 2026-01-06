import { memo } from "react";
import { Link } from "react-router";
import { Heart, Shield } from "lucide-react";
import { Countdown } from "@/components/shared/countdown";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BidHistoryTable } from "@/components/shared/bid-history";
import { cn, formatUSD, maskName } from "@/lib/utils";

interface ProductBiddingPanelProps {
  currentPrice: number;
  endTime: string;
  highestBidder?: {
    id: string;
    avatar: string;
    name: string;
    rating?: number;
    ratingCount?: number;
  };
  minimumBid: number;
  bidStep: number;
  buyNowPrice?: number;
  status: string;
  inWatchlist: boolean;
  isSeller?: boolean; // New prop to check if current user is the seller
  bids?: any[]; // Bid history for seller view
  onPlaceBid: () => void;
  onBuyNow: () => void;
  onWatchlistToggle: () => void;
  onRejectBidder?: (bidderId: string) => void;
}

export const ProductBiddingPanel = memo(function ProductBiddingPanel({
  currentPrice,
  endTime,
  highestBidder,
  minimumBid,
  bidStep,
  buyNowPrice,
  status,
  inWatchlist,
  isSeller = false,
  bids = [],
  onPlaceBid,
  onBuyNow,
  onWatchlistToggle,
  onRejectBidder,
}: ProductBiddingPanelProps) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-bg-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-text-muted">Current Bid</p>
          <p className="text-3xl font-bold text-text">
            {formatUSD(currentPrice)}
          </p>
        </div>
        <Countdown endTime={endTime} size="lg" />
      </div>

      {/* Highest Bidder */}
      {highestBidder && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-bg-secondary p-3">
          <Link to={`/users/${highestBidder.id}`}>
            <Avatar
              src={highestBidder.avatar}
              fallback={highestBidder.name}
              size="sm"
            />
          </Link>
          <div className="flex-1">
            <p className="text-sm text-text-muted">Highest Bidder</p>
            <Link
              to={`/users/${highestBidder.id}`}
              className="font-medium text-text hover:text-primary hover:underline"
            >
              {maskName(highestBidder.name)}
            </Link>
            {highestBidder.ratingCount && highestBidder.ratingCount > 0 && (
              <p className="text-xs text-text-muted">
                {(((highestBidder.rating || 0) / 5) * 100).toFixed(0)}% positive
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bid Info */}
      <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-text-muted">Minimum Bid</p>
          <p className="font-semibold text-text">{formatUSD(minimumBid)}</p>
        </div>
        <div>
          <p className="text-text-muted">Bid Increment</p>
          <p className="font-semibold text-text">+{formatUSD(bidStep)}</p>
        </div>
      </div>

      {/* Action Buttons or Bid History */}
      {isSeller ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
            <p className="text-sm font-medium text-text">
              This is your product
            </p>
          </div>

          {/* Bid History for Seller */}
          {bids.length > 0 ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text">
                Bid History ({bids.length})
              </h3>
              <div className="max-h-[400px] overflow-y-auto">
                <BidHistoryTable
                  bids={bids}
                  isSeller={true}
                  onRejectBidder={onRejectBidder}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-bg-secondary p-4 text-center">
              <p className="text-sm text-text-muted">No bids yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            onClick={onPlaceBid}
            className="w-full"
            size="lg"
            disabled={status !== "ACTIVE"}
          >
            Place Bid
          </Button>

          {buyNowPrice && (
            <Button
              onClick={onBuyNow}
              variant="outline"
              className="w-full border-cta text-cta hover:bg-cta hover:text-white"
              size="lg"
              disabled={status !== "ACTIVE"}
            >
              Buy Now - {formatUSD(buyNowPrice)}
            </Button>
          )}

          {/* Watchlist Button */}
          <Button
            onClick={onWatchlistToggle}
            variant={inWatchlist ? "secondary" : "outline"}
            className="w-full"
          >
            <Heart
              className={cn(
                "mr-2 h-4 w-4",
                inWatchlist && "fill-current text-cta",
              )}
            />
            {inWatchlist ? "Watching" : "Add to Watchlist"}
          </Button>

          {/* Trust indicators */}
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-text-muted">
            <Shield className="h-4 w-4 text-success" />
            Buyer Protection Guarantee
          </div>
        </div>
      )}
    </div>
  );
});
