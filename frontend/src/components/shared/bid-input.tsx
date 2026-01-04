import { useState } from "react";
import { AlertTriangle, CheckCircle, Minus, Plus } from "lucide-react";
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
  allowNewBidders?: boolean;
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
  allowNewBidders = true,
  className,
}: BidInputProps) {
  const [bidAmount, setBidAmount] = useState(minimumBid);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const hasNoRatings = !userRating || userRating.total === 0;
  const hasGoodRatingScore = userRating
    ? hasGoodRating(userRating.positive, userRating.total)
    : true;

  // Check if user can bid based on rating and allowNewBidders
  const canBidRating = hasNoRatings ? allowNewBidders : hasGoodRatingScore;
  const isValidBid = bidAmount >= minimumBid;

  const handleIncrement = () => {
    setBidAmount((prev) => prev + bidStep);
  };

  const handleDecrement = () => {
    setBidAmount((prev) => Math.max(minimumBid, prev - bidStep));
  };

  const handleSubmit = () => {
    if (isValidBid && canBidRating) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    onPlaceBid(bidAmount);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  // Confirmation view
  if (showConfirmation) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg border border-primary/20 bg-primary-light p-4 text-center">
          <CheckCircle className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="mb-1 font-semibold text-text">Confirm Your Bid</h3>
          <p className="text-sm text-text-muted">
            You are about to place a bid of
          </p>
          <p className="my-2 text-2xl font-bold text-primary">
            {formatUSD(bidAmount)}
          </p>
          <p className="text-xs text-text-muted">
            This action cannot be undone. By confirming, you agree to purchase
            this item if you win.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            isLoading={isLoading}
          >
            Confirm Bid
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current bid info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Current Bid</span>
        <span className="text-lg font-bold text-text">
          {formatUSD(currentPrice)}
        </span>
      </div>

      {/* Rating warning - low rating */}
      {userRating && !hasNoRatings && !hasGoodRatingScore && (
        <div className="rounded-lg border border-error/20 bg-error-light p-3 text-sm text-error">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          Your rating is below 80%. You cannot place bids on this auction.
        </div>
      )}

      {/* Rating warning - new bidder not allowed */}
      {hasNoRatings && !allowNewBidders && (
        <div className="rounded-lg border border-warning/20 bg-warning-light p-3 text-sm text-warning">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          The seller does not allow new bidders (users without ratings) on this
          auction.
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
        disabled={disabled || !isValidBid || !canBidRating || isLoading}
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
