import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function UserMenu() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

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

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return (
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
    );
  }

  return (
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
        <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-bg-card shadow-xl duration-150">
          <div className="border-b border-border p-3">
            <p className="font-medium text-text">{user.fullName}</p>
            <p className="truncate text-sm text-text-muted">{user.email}</p>
          </div>

          <div className="p-1">
            <Link
              to="/profile"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-bg-secondary"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>

            {user.role === "ADMIN" && (
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
  );
}
