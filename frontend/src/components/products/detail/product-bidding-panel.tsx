import { memo } from "react";
import { Heart, Share2, Shield } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/shared/countdown";
import { cn, formatUSD, maskName } from "@/lib/utils";

interface ProductBiddingPanelProps {
  currentPrice: number;
  endTime: string;
  highestBidder?: { avatar: string; name: string };
  minimumBid: number;
  bidStep: number;
  buyNowPrice?: number;
  status: string;
  inWatchlist: boolean;
  onPlaceBid: () => void;
  onBuyNow: () => void;
  onWatchlistToggle: () => void;
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
  onPlaceBid,
  onBuyNow,
  onWatchlistToggle,
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

      {/* Action Buttons */}
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

        <div className="flex gap-3">
          <Button
            onClick={onWatchlistToggle}
            variant={inWatchlist ? "secondary" : "ghost"}
            className="flex-1"
          >
            <Heart
              className={cn("mr-2 h-4 w-4", inWatchlist && "fill-current")}
            />
            {inWatchlist ? "Watching" : "Add to Watchlist"}
          </Button>
          <Button variant="ghost" className="px-4">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-text-muted">
        <Shield className="h-4 w-4 text-success" />
        Buyer Protection Guarantee
      </div>
    </div>
  );
});
