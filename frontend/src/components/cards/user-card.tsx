import { Link } from "react-router";
import { RatingBadge } from "@/components/shared/rating";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

// Helper to extract rating info from both old and new structures
function getRatingInfo(user: User): { positive: number; total: number } {
  if (typeof user.rating === "number") {
    // New structure: rating is a number (0-5), use ratingCount
    const ratingCount = user.ratingCount || 0;
    const positive =
      ratingCount > 0 ? Math.round((user.rating / 5) * ratingCount) : 0;
    return { positive, total: ratingCount };
  }
  // Old structure: rating is an object
  return { positive: user.rating.positive, total: user.rating.total };
}

export interface UserCardProps {
  user: User;
  variant?: "default" | "compact" | "detailed";
  showRating?: boolean;
  showRole?: boolean;
  className?: string;
}

export function UserCard({
  user,
  variant = "default",
  showRating = true,
  showRole = true,
  className,
}: UserCardProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Avatar
          src={user.avatar}
          alt={user.fullName}
          fallback={user.fullName}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">
            {user.fullName || user.name}
          </p>
          {showRating && (
            <RatingBadge
              positive={getRatingInfo(user).positive}
              total={getRatingInfo(user).total}
              size="sm"
            />
          )}
        </div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-bg-card p-4",
          className,
        )}
      >
        <div className="flex items-start gap-4">
          <Avatar
            src={user.avatar}
            alt={user.fullName || user.name}
            fallback={user.fullName || user.name}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="font-semibold text-text">
                {user.fullName || user.name}
              </h4>
              {showRole && user.role && <RoleBadge role={user.role as any} />}
            </div>
            <p className="mb-2 text-sm text-text-muted">{user.email}</p>
            {showRating && (
              <RatingBadge
                positive={getRatingInfo(user).positive}
                total={getRatingInfo(user).total}
                showDetails
              />
            )}
          </div>
        </div>

        {user.address && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs text-text-muted">Address</p>
            <p className="text-sm text-text">{user.address}</p>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-bg-card p-3",
        className,
      )}
    >
      <Avatar
        src={user.avatar}
        alt={user.fullName || user.name}
        fallback={user.fullName || user.name}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium text-text">
            {user.fullName || user.name}
          </h4>
          {showRole && user.role && <RoleBadge role={user.role as any} />}
        </div>
        {showRating && (
          <RatingBadge
            positive={getRatingInfo(user).positive}
            total={getRatingInfo(user).total}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}

// Seller Info Card for Product Detail Page
export function SellerInfoCard({
  seller,
  className,
}: {
  seller: any; // Seller from product API has different structure than User
  className?: string;
}) {
  const displayName = seller.name || seller.fullName || "Unknown Seller";
  const avatarUrl = seller.avatar || null;

  // Calculate percentage from rating (0-5) and ratingCount
  const totalRatings = seller.ratingCount || 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg-card p-4",
        className,
      )}
    >
      <p className="mb-3 text-xs tracking-wide text-text-muted uppercase">
        Seller
      </p>
      <div className="flex items-center gap-3">
        <Link to={`/users/${seller.id}`}>
          <Avatar
            src={avatarUrl}
            alt={displayName}
            fallback={displayName}
            size="lg"
          />
        </Link>
        <div>
          <Link
            to={`/users/${seller.id}`}
            className="font-semibold text-text hover:text-primary hover:underline"
          >
            {displayName}
          </Link>
          {totalRatings > 0 ? (
            <p className="text-sm text-text-muted">
              {seller.rating?.toFixed(1)}/5 ({totalRatings}{" "}
              {totalRatings === 1 ? "rating" : "ratings"})
            </p>
          ) : (
            <p className="text-sm text-text-muted">No ratings yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
