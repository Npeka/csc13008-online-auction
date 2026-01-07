import { useState } from "react";
import { AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatUSD, hasGoodRating } from "@/lib/utils";

export interface BidInputProps {
  currentPrice: number;
  bidStep: number;
  minimumBid: number;
  onPlaceBid: (maxAmount: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
  userRating?: { positive: number; total: number };
  allowNewBidders?: boolean;
  currentMaxBid?: number; // User's current max bid if they already have one
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
  currentMaxBid,
  className,
}: BidInputProps) {
  const [maxBidAmount, setMaxBidAmount] = useState(
    currentMaxBid || minimumBid + bidStep * 5,
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showIncreaseModal, setShowIncreaseModal] = useState(false);
  const [increaseAmount, setIncreaseAmount] = useState(bidStep * 5);

  const hasNoRatings = !userRating || userRating.total === 0;
  const hasGoodRatingScore = userRating
    ? hasGoodRating(userRating.positive, userRating.total)
    : true;

  // Check if user can bid based on rating and allowNewBidders
  const canBidRating = hasNoRatings ? allowNewBidders : hasGoodRatingScore;
  const isValidMaxBid = maxBidAmount >= minimumBid;

  const handleSubmit = () => {
    if (isValidMaxBid && canBidRating) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    onPlaceBid(maxBidAmount);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleIncreaseMax = () => {
    if (currentMaxBid) {
      setShowIncreaseModal(true);
    }
  };

  const handleConfirmIncrease = () => {
    const newMaxBid = (currentMaxBid || 0) + increaseAmount;
    setMaxBidAmount(newMaxBid);
    setShowIncreaseModal(false);
    onPlaceBid(newMaxBid);
  };

  // Increase max bid modal
  if (showIncreaseModal) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h3 className="mb-2 font-semibold text-text">Increase Your Max Bid</h3>
          <p className="mb-1 text-sm text-text-muted">Current Max Bid:</p>
          <p className="mb-3 text-2xl font-bold text-text">
            {formatUSD(currentMaxBid || 0)}
          </p>

          <div className="mb-3">
            <label className="mb-1 block text-sm text-text-muted">
              Increase Amount
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">
                $
              </span>
              <Input
                type="number"
                value={increaseAmount}
                onChange={(e) => setIncreaseAmount(Number(e.target.value))}
                min={bidStep}
                step={bidStep}
                className="pl-8 text-lg font-semibold"
              />
            </div>
          </div>

          <div className="rounded-lg bg-bg-secondary p-3">
            <p className="text-sm text-text-muted">New Max Bid:</p>
            <p className="text-xl font-bold text-primary">
              {formatUSD((currentMaxBid || 0) + increaseAmount)}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowIncreaseModal(false)}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmIncrease}
            className="flex-1"
            isLoading={isLoading}
          >
            Confirm Increase
          </Button>
        </div>
      </div>
    );
  }

  // Confirmation view
  if (showConfirmation) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <CheckCircle className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="mb-1 font-semibold text-text">Confirm Your Max Bid</h3>
          <p className="text-sm text-text-muted">
            Your maximum bid amount will be
          </p>
          <p className="my-2 text-2xl font-bold text-primary">
            {formatUSD(maxBidAmount)}
          </p>

          <div className="mt-3 rounded-lg bg-bg-secondary p-3 text-left text-sm">
            <p className="font-medium text-text">How it works:</p>
            <ul className="mt-2 space-y-1 text-text-muted">
              <li>• We'll bid the minimum amount needed to make you the highest bidder</li>
              <li>• If someone outbids you, we'll automatically bid again up to your max</li>
              <li>• You'll only pay the final winning amount, not your max bid</li>
            </ul>
          </div>

          <p className="mt-3 text-xs text-text-muted">
            By confirming, you agree to purchase this item if you win.
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

  // If user already has a max bid, show it with increase option
  if (currentMaxBid && currentMaxBid >= minimumBid) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-text">Your Current Max Bid</p>
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">
              {formatUSD(currentMaxBid)}
            </p>
            <Button
              onClick={handleIncreaseMax}
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={disabled || isLoading}
            >
              <Plus className="h-4 w-4" />
              Increase
            </Button>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {currentMaxBid > currentPrice
              ? "Your auto-bid is active and will continue bidding up to this amount."
              : "Your max bid is below the current price. Increase it to stay in the auction."}
          </p>
        </div>

        <div className="rounded-lg bg-bg-secondary p-3 text-sm">
          <p className="font-medium text-text">Current Status:</p>
          <div className="mt-2 space-y-1 text-text-muted">
            <p>Current Bid: {formatUSD(currentPrice)}</p>
            <p>Your Max: {formatUSD(currentMaxBid)}</p>
            {currentMaxBid > currentPrice && (
              <p className="text-primary">
                ✓ You're still in the running!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // New bid form
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
        <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          Your rating is below 80%. You cannot place bids on this auction.
        </div>
      )}

      {/* Rating warning - new bidder not allowed */}
      {hasNoRatings && !allowNewBidders && (
        <div className="rounded-lg border border-warning/20 bg-orange-50 p-3 text-sm text-warning">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          The seller does not allow new bidders (users without ratings) on this
          auction.
        </div>
      )}

      {/* Max Bid Input */}
      <div className="space-y-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-3">
            <h3 className="mb-1 font-semibold text-text">Automatic Bidding</h3>
            <p className="text-xs text-text-muted">
              Enter your maximum bid and we'll automatically bid for you to get the best price
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Your Maximum Bid
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">
                $
              </span>
              <Input
                type="number"
                value={maxBidAmount}
                onChange={(e) => setMaxBidAmount(Number(e.target.value))}
                disabled={disabled}
                min={minimumBid}
                step={bidStep}
                className={cn(
                  "pl-8 text-lg font-semibold",
                  !isValidMaxBid && "border-error focus:ring-error",
                )}
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Minimum: {formatUSD(minimumBid)}
            </p>
          </div>

          <div className="mt-3 rounded-lg bg-bg-card p-3 text-xs text-text-muted">
            <p className="font-medium text-text">How it works:</p>
            <ul className="mt-1 space-y-0.5">
              <li>• We place the minimum bid needed to make you the highest bidder</li>
              <li>• If outbid, we automatically bid again (up to your max)</li>
              <li>• You only pay the final amount, not your max bid</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Place bid button */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || !isValidMaxBid || !canBidRating || isLoading}
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        Place Automatic Bid
      </Button>
    </div>
  );
}
