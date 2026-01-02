import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatUSD, hasGoodRating } from "@/lib/utils";

export interface BidInputProps {
  currentPrice: number;
  bidStep: number;
  minimumBid: number;
  onPlaceBid: (amount: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
  userRating?: { positive: number; total: number };
  className?: string;
}

export function BidInput({
  currentPrice,
  bidStep,
  minimumBid,
  onPlaceBid,
  isLoading = false,
  disabled = false,
  userRating,
  className,
}: BidInputProps) {
  const [bidAmount, setBidAmount] = useState(minimumBid);

  const canBid =
    !userRating || hasGoodRating(userRating.positive, userRating.total);
  const isValidBid = bidAmount >= minimumBid;

  const handleIncrement = () => {
    setBidAmount((prev) => prev + bidStep);
  };

  const handleDecrement = () => {
    setBidAmount((prev) => Math.max(minimumBid, prev - bidStep));
  };

  const handleSubmit = () => {
    if (isValidBid && canBid) {
      onPlaceBid(bidAmount);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current bid info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Current Bid</span>
        <span className="text-lg font-bold text-text">
          {formatUSD(currentPrice)}
        </span>
      </div>

      {/* Rating warning */}
      {userRating && !canBid && (
        <div className="rounded-lg border border-error/20 bg-error-light p-3 text-sm text-error">
          Your rating is below 80%. You cannot place bids on this auction.
        </div>
      )}

      {/* Bid input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">Your Bid</label>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={disabled || bidAmount <= minimumBid}
            className={cn(
              "cursor-pointer rounded-lg border border-border p-2 transition-colors",
              "hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Minus className="h-5 w-5" />
          </button>

          <div className="relative flex-1">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">
              $
            </span>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) =>
                setBidAmount(Math.max(minimumBid, Number(e.target.value)))
              }
              disabled={disabled}
              min={minimumBid}
              step={bidStep}
              className={cn(
                "w-full rounded-lg py-3 pr-4 pl-8 text-center text-lg font-bold",
                "border border-border bg-bg-card text-text",
                "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                !isValidBid && "border-error",
              )}
            />
          </div>

          <button
            onClick={handleIncrement}
            disabled={disabled}
            className={cn(
              "cursor-pointer rounded-lg border border-border p-2 transition-colors",
              "hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Minimum bid hint */}
        <p className="text-xs text-text-muted">
          Minimum bid: {formatUSD(minimumBid)} (Current + {formatUSD(bidStep)}{" "}
          increment)
        </p>
      </div>

      {/* Place bid button */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || !isValidBid || !canBid || isLoading}
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        Place Bid {formatUSD(bidAmount)}
      </Button>
    </div>
  );
}

// Quick Bid Buttons
export function QuickBidButtons({
  minimumBid,
  bidStep,
  onSelectAmount,
  className,
}: {
  minimumBid: number;
  bidStep: number;
  onSelectAmount: (amount: number) => void;
  className?: string;
}) {
  const quickAmounts = [
    minimumBid,
    minimumBid + bidStep,
    minimumBid + bidStep * 2,
    minimumBid + bidStep * 5,
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {quickAmounts.map((amount) => (
        <button
          key={amount}
          onClick={() => onSelectAmount(amount)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            "border border-border hover:border-primary hover:text-primary",
            "cursor-pointer transition-colors",
          )}
        >
          {formatUSD(amount)}
        </button>
      ))}
    </div>
  );
}
