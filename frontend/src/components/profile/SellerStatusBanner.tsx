import { AlertCircle, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types";

interface SellerStatusBannerProps {
  user: User;
}

export function SellerStatusBanner({ user }: SellerStatusBannerProps) {
  // Only show for sellers with temporary status (has expiration date)
  if (user.role !== "SELLER" || !user.sellerExpiresAt) {
    return null;
  }

  // Temporary seller - calculate remaining time
  const expiresAt = new Date(user.sellerExpiresAt);
  const now = new Date();
  const isExpired = now > expiresAt;
  const daysRemaining = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (isExpired) {
    return (
      <div className="mb-6 rounded-xl border border-error/20 bg-error/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-error" />
          <div className="flex-1">
            <h3 className="font-semibold text-text">
              Seller Privileges Expired
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              Your temporary seller privileges expired on{" "}
              {expiresAt.toLocaleDateString()}. You can still manage your
              existing auctions and orders, but cannot create new products.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Request a new upgrade to regain seller privileges.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active temporary seller
  const urgency = daysRemaining <= 2;

  return (
    <div
      className={`mb-6 rounded-xl border p-4 ${urgency ? "border-warning/20 bg-warning/5" : "border-primary/20 bg-primary/5"}`}
    >
      <div className="flex items-start gap-3">
        <Clock
          className={`h-5 w-5 shrink-0 ${urgency ? "text-warning" : "text-primary"}`}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-text">
              Temporary Seller Account
            </h3>
            <Badge variant={urgency ? "warning" : "info"} className="text-xs">
              {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Your seller privileges expire on{" "}
            <span className="font-medium text-text">
              {expiresAt.toLocaleDateString()} at{" "}
              {expiresAt.toLocaleTimeString()}
            </span>
            . Create auctions while you can!
          </p>
          {urgency && (
            <p className="mt-2 text-sm font-medium text-text">
              ⚠️ Time is running out! Request a new upgrade before expiry to
              continue creating products.
            </p>
          )}
          <p className="mt-2 text-xs text-text-muted">
            <Calendar className="mr-1 inline h-3 w-3" />
            After expiry, you'll still be able to manage existing auctions and
            process orders.
          </p>
        </div>
      </div>
    </div>
  );
}
