import React from "react";
import { Link } from "react-router";
import { ChevronRight,Gavel, Heart, Star, Trophy } from "lucide-react";

/**
 * QuickLinks
 * Renders a list of navigation links for the profile page.
 */
export const QuickLinks: React.FC = () => {
  const links = [
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
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold text-text">Quick Links</h2>
      </div>
      <div className="divide-y divide-border">
        {links.map((link) => (
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
  );
};
