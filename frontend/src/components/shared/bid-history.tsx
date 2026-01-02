import { format } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatUSD, maskName } from "@/lib/utils";
import type { Bid } from "@/types";

export interface BidHistoryProps {
  bids: Bid[];
  showAvatar?: boolean;
  maxItems?: number;
  className?: string;
}

export function BidHistory({
  bids,
  showAvatar = true,
  maxItems,
  className,
}: BidHistoryProps) {
  const displayBids = maxItems ? bids.slice(0, maxItems) : bids;

  if (displayBids.length === 0) {
    return (
      <div className="py-8 text-center text-text-muted">
        No bids yet. Be the first to bid!
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {displayBids.map((bid, index) => (
        <div
          key={bid.id}
          className={cn(
            "flex items-center justify-between rounded-lg p-3",
            index === 0
              ? "border border-primary/20 bg-primary-light"
              : "bg-bg-secondary",
          )}
        >
          <div className="flex items-center gap-3">
            {showAvatar && (
              <Avatar
                src={bid.bidder.avatar}
                alt={bid.bidder.name}
                fallback={bid.bidder.name}
                size="sm"
              />
            )}
            <div>
              <div className="font-medium text-text">
                {maskName(bid.bidder.name || "Anonymous")}
                {index === 0 && (
                  <span className="ml-2 text-xs font-normal text-primary">
                    Highest
                  </span>
                )}
              </div>
              <div className="text-xs text-text-muted">
                {format(new Date(bid.createdAt), "MMM d, yyyy h:mm a")}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "text-lg font-bold",
              index === 0 ? "text-primary" : "text-text",
            )}
          >
            {formatUSD(bid.amount)}
          </div>
        </div>
      ))}

      {maxItems && bids.length > maxItems && (
        <p className="pt-2 text-center text-sm text-text-muted">
          +{bids.length - maxItems} more bids
        </p>
      )}
    </div>
  );
}

// Compact Bid History Table
export function BidHistoryTable({
  bids,
  className,
}: {
  bids: Bid[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-text-muted">
              Bidder
            </th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">
              Time
            </th>
            <th className="px-4 py-3 text-right font-medium text-text-muted">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid, index) => (
            <tr
              key={bid.id}
              className={cn(
                "border-b border-border last:border-0",
                index === 0 && "bg-primary-light",
              )}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={bid.bidder.avatar}
                    fallback={bid.bidder.name}
                    size="xs"
                  />
                  <span className="font-medium">
                    {maskName(bid.bidder.name || "Anonymous")}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-text-muted">
                {format(new Date(bid.createdAt), "MMM d, h:mm a")}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-bold",
                  index === 0 ? "text-primary" : "text-text",
                )}
              >
                {formatUSD(bid.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
