import { cn, calculateRatingPercentage, formatRating } from "@/lib/utils";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

// Rating Badge - Shows rating score with percentage
export interface RatingBadgeProps {
  positive: number;
  total: number;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingBadge({
  positive,
  total,
  showDetails = false,
  size = "md",
  className,
}: RatingBadgeProps) {
  const percentage = calculateRatingPercentage(positive, total);
  const isGood = percentage >= 80;
  const isNew = total === 0;

  const sizeStyles = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  if (isNew) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium",
          "bg-info-light text-info",
          sizeStyles[size],
          className,
        )}
      >
        <Star className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        New
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        isGood
          ? "bg-success-light text-success"
          : "bg-warning-light text-warning",
        sizeStyles[size],
        className,
      )}
    >
      {isGood ? (
        <ThumbsUp className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      ) : (
        <ThumbsDown className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      )}
      {showDetails ? formatRating(positive, total) : `${percentage}%`}
    </span>
  );
}

// Rating Input Component
export interface RatingInputProps {
  value: 1 | -1 | null;
  onChange: (value: 1 | -1) => void;
  disabled?: boolean;
  className?: string;
}

export function RatingInput({
  value,
  onChange,
  disabled = false,
  className,
}: RatingInputProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        onClick={() => onChange(1)}
        disabled={disabled}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors",
          "border-2",
          value === 1
            ? "border-success bg-success-light text-success"
            : "border-border text-text-muted hover:border-success hover:text-success",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <ThumbsUp className="h-5 w-5" />
        Positive
      </button>
      <button
        type="button"
        onClick={() => onChange(-1)}
        disabled={disabled}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors",
          "border-2",
          value === -1
            ? "border-error bg-error-light text-error"
            : "border-border text-text-muted hover:border-error hover:text-error",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <ThumbsDown className="h-5 w-5" />
        Negative
      </button>
    </div>
  );
}

// Rating Stats Display
export interface RatingStatsProps {
  positive: number;
  total: number;
  className?: string;
}

export function RatingStats({ positive, total, className }: RatingStatsProps) {
  const negative = total - positive;
  const percentage = calculateRatingPercentage(positive, total);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-text-muted">Overall Rating</span>
        <RatingBadge positive={positive} total={total} showDetails size="lg" />
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
        <div
          className="h-full rounded-full bg-success transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-1 text-success">
          <ThumbsUp className="h-4 w-4" />
          {positive} positive
        </div>
        <div className="flex items-center gap-1 text-error">
          <ThumbsDown className="h-4 w-4" />
          {negative} negative
        </div>
      </div>
    </div>
  );
}
