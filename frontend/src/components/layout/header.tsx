import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search,
  Heart,
  User,
  Menu,
  Sun,
  Moon,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MegaMenu, MobileMenu } from "./mega-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { useWatchlistCount } from "@/stores/watchlist-store";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const watchlistCount = useWatchlistCount();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-1000 border-b border-border bg-bg-card/95 backdrop-blur-md">
        <div className="container-app">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-bg-secondary lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center">
              <div className="size-20">
                <img src="src/assets/logo.avif" alt="logo" />
              </div>
              <span className="hidden text-xl font-bold text-text sm:block">
                Morphee
              </span>
            </Link>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="mx-4 hidden flex-1 md:flex"
              style={{ maxWidth: "36rem" }}
            >
              <div className="relative w-full">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories..."
                  className={cn(
                    "w-full rounded-xl py-2.5 pr-4 pl-10",
                    "border border-transparent bg-bg-secondary",
                    "text-text placeholder:text-text-muted",
                    "focus:border-primary focus:bg-bg-card focus:outline-none",
                    "transition-colors",
                  )}
                />
              </div>
            </form>

            {/* Right Actions */}
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

              {/* Auth / User Menu */}
              {isAuthenticated && user ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-bg-secondary"
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.fullName}
                      fallback={user.fullName}
                      size="sm"
                    />
                    <span className="hidden max-w-[100px] truncate text-sm font-medium lg:block">
                      {user.fullName}
                    </span>
                    <ChevronDown
                      className={cn(
                        "hidden h-4 w-4 transition-transform lg:block",
                        isUserMenuOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="z-dropdown animate-in fade-in slide-in-from-top-2 absolute top-full right-0 mt-2 w-56 rounded-xl border border-border bg-bg-card shadow-xl duration-150">
                      <div className="border-b border-border p-3">
                        <p className="font-medium text-text">{user.fullName}</p>
                        <p className="text-sm text-text-muted">{user.email}</p>
                      </div>

                      <div className="p-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-bg-secondary"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>

                        {user.role === "seller" && (
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-bg-secondary"
                          >
                            <Package className="h-4 w-4" />
                            Seller Dashboard
                          </Link>
                        )}

                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-bg-secondary"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}

                        <Link
                          to="/profile/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-bg-secondary"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-border p-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-error transition-colors hover:bg-error-light"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" className="hidden sm:block">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Category Navigation - Desktop */}
          <div className="hidden border-t border-border py-2 lg:block">
            <MegaMenu />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={cn(
                  "w-full rounded-xl py-2.5 pr-4 pl-10",
                  "border border-transparent bg-bg-secondary",
                  "text-text placeholder:text-text-muted",
                  "focus:border-primary focus:outline-none",
                  "transition-colors",
                )}
              />
            </div>
          </form>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
