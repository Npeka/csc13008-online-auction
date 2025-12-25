import { useState } from "react";
import { Link } from "react-router";
import {
  Heart,
  Gavel,
  Trophy,
  Star,
  Settings,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/shared/rating";
import { UpgradeRequestModal } from "@/components/shared/upgrade-request-modal";
import { useAuthStore } from "@/stores/auth-store";

export function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-text">Please Login</h1>
        <p className="mb-8 text-text-muted">
          You need to be logged in to view your profile.
        </p>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  const ratingPercent =
    user.rating.total > 0
      ? Math.round((user.rating.positive / user.rating.total) * 100)
      : 0;

  const stats = [
    {
      label: "Active Bids",
      value: 5,
      icon: <Gavel className="h-5 w-5" />,
      href: "/profile/bids",
    },
    {
      label: "Won Auctions",
      value: 12,
      icon: <Trophy className="h-5 w-5" />,
      href: "/profile/won",
    },
    {
      label: "Watchlist",
      value: 8,
      icon: <Heart className="h-5 w-5" />,
      href: "/profile/watchlist",
    },
    {
      label: "Rating",
      value: `${ratingPercent}%`,
      icon: <Star className="h-5 w-5" />,
      href: "/profile/ratings",
    },
  ];

  return (
    <div className="container-app py-10">
      {/* Profile Header */}
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
          <Link to="/profile/settings">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-primary"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-light p-2 text-primary">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold text-text">Quick Links</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              label: "My Watchlist",
              href: "/profile/watchlist",
              icon: <Heart className="h-5 w-5" />,
            },
            {
              label: "Active Bids",
              href: "/profile/bids",
              icon: <Gavel className="h-5 w-5" />,
            },
            {
              label: "Won Auctions",
              href: "/profile/won",
              icon: <Trophy className="h-5 w-5" />,
            },
            {
              label: "My Ratings",
              href: "/profile/ratings",
              icon: <Star className="h-5 w-5" />,
            },
            {
              label: "Account Settings",
              href: "/profile/settings",
              icon: <Settings className="h-5 w-5" />,
            },
          ].map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center justify-between p-4 transition-colors hover:bg-bg-secondary"
            >
              <div className="flex items-center gap-3">
                <span className="text-text-muted">{link.icon}</span>
                <span className="font-medium text-text">{link.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-text-muted" />
            </Link>
          ))}
        </div>
      </div>

      {/* Upgrade to Seller */}
      {user.role === "bidder" && (
        <div className="mt-8 rounded-xl bg-linear-to-r from-primary to-cta p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-2 text-xl font-bold">Become a Seller</h3>
              <p className="text-white/80">
                Start selling your items and reach thousands of buyers.
              </p>
            </div>
            <Button
              className="bg-white text-primary! hover:bg-white/90"
              onClick={() => setShowUpgradeModal(true)}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Request Upgrade
            </Button>
          </div>
        </div>
      )}

      {/* Upgrade Request Modal */}
      <UpgradeRequestModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
