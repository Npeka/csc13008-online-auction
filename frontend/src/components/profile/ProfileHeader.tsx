import React from "react";
import { RatingBadge } from "@/components/shared/rating";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/badge";

/**
 * ProfileHeader
 * Displays user avatar, name, role, email, rating.
 */
export const ProfileHeader: React.FC<{ user: any }> = ({ user }) => (
  <div className="mb-10 rounded-xl border border-border bg-bg-card p-6">
    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      <Avatar
        src={user.avatar}
        alt={user.fullName}
        fallback={user.fullName}
        size="xl"
      />
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text">{user.fullName}</h1>
          <RoleBadge role={user.role} />
        </div>
        <p className="text-text-muted">{user.email}</p>
        <div className="mt-3">
          <RatingBadge
            positive={user.rating.positive}
            total={user.rating.total}
            showDetails
          />
        </div>
      </div>
    </div>
  </div>
);
