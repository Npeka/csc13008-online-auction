import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { RatingBadge } from "@/components/shared/rating";
import { RoleBadge } from "@/components/ui/badge";
import type { User } from "@/types";

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
            {user.fullName}
          </p>
          {showRating && (
            <RatingBadge
              positive={user.rating.positive}
              total={user.rating.total}
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
            alt={user.fullName}
            fallback={user.fullName}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="font-semibold text-text">{user.fullName}</h4>
              {showRole && <RoleBadge role={user.role} />}
            </div>
            <p className="mb-2 text-sm text-text-muted">{user.email}</p>
            {showRating && (
              <RatingBadge
                positive={user.rating.positive}
                total={user.rating.total}
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
        alt={user.fullName}
        fallback={user.fullName}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium text-text">{user.fullName}</h4>
          {showRole && <RoleBadge role={user.role} />}
        </div>
        {showRating && (
          <RatingBadge
            positive={user.rating.positive}
            total={user.rating.total}
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
  seller: User;
  className?: string;
}) {
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
        <Avatar
          src={seller.avatar}
          alt={seller.fullName}
          fallback={seller.fullName}
          size="lg"
        />
        <div>
          <h4 className="font-semibold text-text">{seller.fullName}</h4>
          <RatingBadge
            positive={seller.rating.positive}
            total={seller.rating.total}
            showDetails
          />
        </div>
      </div>
    </div>
  );
}
