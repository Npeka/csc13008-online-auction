import { Link } from "react-router";
import { Gavel, Heart, Moon, Package, Sun, Trophy } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { useCountsStore } from "@/stores/counts-store";
import { UserMenu } from "./user-menu";

export function HeaderActions() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const { watchlist, products, bidding, won } = useCountsStore();

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-bg-secondary"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>

      {/* Watchlist */}
      <Link
        to="/profile/watchlist"
        className="relative rounded-lg p-2 transition-colors hover:bg-bg-secondary"
        title="Watchlist"
      >
        <Heart className="h-5 w-5" />
        {watchlist > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cta text-xs font-bold text-white">
            {watchlist > 9 ? "9+" : watchlist}
          </span>
        )}
      </Link>

      {/* My Products - Show for authenticated users */}
      {isAuthenticated && (
        <Link
          to="/seller/products"
          className="relative rounded-lg p-2 transition-colors hover:bg-bg-secondary"
          title="My Products"
        >
          <Package className="h-5 w-5" />
          {products > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cta text-xs font-bold text-white">
              {products > 9 ? "9+" : products}
            </span>
          )}
        </Link>
      )}

      {/* My Bids - Authenticated only */}
      {isAuthenticated && (
        <Link
          to="/profile/bids"
          className="relative rounded-lg p-2 transition-colors hover:bg-bg-secondary"
          title="My Bids"
        >
          <Gavel className="h-5 w-5" />
          {bidding > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cta text-xs font-bold text-white">
              {bidding > 9 ? "9+" : bidding}
            </span>
          )}
        </Link>
      )}

      {/* Won Auctions - Authenticated only */}
      {isAuthenticated && (
        <Link
          to="/profile/won"
          className="relative rounded-lg p-2 transition-colors hover:bg-bg-secondary"
          title="Won Auctions"
        >
          <Trophy className="h-5 w-5" />
          {won > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cta text-xs font-bold text-white">
              {won > 9 ? "9+" : won}
            </span>
          )}
        </Link>
      )}

      {/* User Menu */}
      <UserMenu />
    </div>
  );
}
