import { memo } from "react";
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
  isEnded?: boolean; // Is the auction ended
  userParticipated?: boolean; // Did the user participate in the auction
  isWinner?: boolean; // Is the current user the winner
  order?: any; // Order data for ended auctions
  orderLoading?: boolean; // Loading state for order data
  onPlaceBid: () => void;
  onBuyNow: () => void;
  onWatchlistToggle: () => void;
  onRejectBidder?: (bidderId: string) => void;
  onNavigateToOrder?: () => void; // Navigate to order page
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
  isEnded = false,
  userParticipated = false,
  isWinner = false,
  order,
  orderLoading = false,
  onPlaceBid,
  onBuyNow,
  onWatchlistToggle,
  onRejectBidder,
  onNavigateToOrder,
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
          <Avatar
            src={highestBidder.avatar}
            fallback={highestBidder.name}
            size="sm"
          />
          <div className="flex-1">
            <p className="text-sm text-text-muted">Highest Bidder</p>
            <p className="font-medium text-text">
              {maskName(highestBidder.name)}
            </p>
            {highestBidder.ratingCount && highestBidder.ratingCount > 0 ? (
              <p className="text-xs text-text-muted">
                {((highestBidder.rating || 0) * 100).toFixed(0)}% positive
              </p>
            ) : (
              <p className="text-xs text-text-muted">No ratings yet</p>
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
          {/* Order button for seller if auction ended */}
          {isEnded && order && (
            <Button
              onClick={onNavigateToOrder}
              className="w-full"
              size="lg"
              variant="default"
            >
              Manage Order
            </Button>
          )}
          {isEnded && orderLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
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
      ) : isEnded && (isWinner || orderLoading) ? (
        // Winner sees payment button or loading state
        <div className="space-y-3">
          {orderLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : order ? (
            <>
              <div className="mb-4 rounded-lg border border-success-light bg-success-light p-4 text-center">
                <p className="text-sm font-medium text-success">
                  🎉 Congratulations! You won this auction
                </p>
              </div>
              <Button onClick={onNavigateToOrder} className="w-full" size="lg">
                Proceed to Payment
              </Button>
            </>
          ) : (
            <div className="rounded-lg border border-border bg-bg-secondary p-4 text-center">
              <p className="text-sm text-text-muted">
                Order is being created...
              </p>
            </div>
          )}
        </div>
      ) : isEnded && userParticipated ? (
        // Losing bidder sees bid history
        <div>
          <div className="mb-4 rounded-lg border border-warning-light bg-warning-light p-4 text-center">
            <p className="text-sm font-medium text-warning">
              This auction has ended
            </p>
          </div>
          <h3 className="mb-3 text-sm font-semibold text-text">
            Bid History ({bids.length})
          </h3>
          <div className="max-h-[400px] overflow-y-auto">
            <BidHistoryTable bids={bids} isSeller={false} />
          </div>
        </div>
      ) : (
        // Active auction - normal bid buttons
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
