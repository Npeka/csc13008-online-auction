import { Link } from "react-router";
import { Heart, Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { useWatchlistCount } from "@/stores/watchlist-store";
import { UserMenu } from "./user-menu";

export function HeaderActions() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const watchlistCount = useWatchlistCount();

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
      >
        <Heart className="h-5 w-5" />
        {watchlistCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cta text-xs font-bold text-white">
            {watchlistCount > 9 ? "9+" : watchlistCount}
          </span>
        )}
      </Link>

      {/* User Menu */}
      <UserMenu />
    </div>
  );
}
