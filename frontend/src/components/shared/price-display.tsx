import { TrendingUp } from "lucide-react";
import { cn, formatUSD } from "@/lib/utils";

export interface PriceDisplayProps {
  amount: number;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTrend?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-3xl",
};

export function PriceDisplay({
  amount,
  label,
  size = "md",
  showTrend = false,
  className,
}: PriceDisplayProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <span className="mb-0.5 text-xs tracking-wide text-text-muted uppercase">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1">
        {showTrend && <TrendingUp className="h-4 w-4 text-success" />}
        <span className={cn("font-bold text-text", sizeStyles[size])}>
          {formatUSD(amount)}
        </span>
      </div>
    </div>
  );
}

// Buy Now Price Component
export function BuyNowPrice({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
        "border border-cta/20 bg-cta-light",
        className,
      )}
    >
      <span className="text-xs font-medium text-cta">Buy Now</span>
      <span className="text-sm font-bold text-cta">{formatUSD(amount)}</span>
    </div>
  );
}

// Bid Price with Step
export function BidPriceInfo({
  currentPrice,
  bidStep,
  buyNowPrice,
  className,
}: {
  currentPrice: number;
  bidStep: number;
  buyNowPrice?: number;
  className?: string;
}) {
  const minimumBid = currentPrice + bidStep;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-text-muted">Current Bid</span>
        <span className="text-xl font-bold text-text">
          {formatUSD(currentPrice)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Minimum Bid</span>
        <span className="font-medium text-primary">
          {formatUSD(minimumBid)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Bid Increment</span>
        <span className="text-text-secondary">+{formatUSD(bidStep)}</span>
      </div>
      {buyNowPrice && (
        <div className="border-t border-border pt-2">
          <BuyNowPrice amount={buyNowPrice} className="w-full justify-center" />
        </div>
      )}
    </div>
  );
}
