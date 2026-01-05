import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { Logo } from "./header/logo";

const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/upgrades", label: "Upgrade Requests", icon: ShieldCheck },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role !== "ADMIN") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-bg-secondary">
      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-0 h-screen shrink-0 border-r border-border bg-bg-card transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header (Logo) */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            {!isCollapsed && <Logo />}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-secondary hover:text-text",
                isCollapsed && "mx-auto",
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {adminNavItems.map((item) => {
              const isActive =
                location.pathname === item.to ||
                (item.to !== "/admin" && location.pathname.startsWith(item.to));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-muted hover:bg-bg-secondary hover:text-text",
                    isCollapsed && "justify-center px-2",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="space-y-1 border-t border-border p-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isCollapsed ? "Toggle Theme" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-bg-secondary hover:text-text",
                isCollapsed && "justify-center px-2",
              )}
            >
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              {!isCollapsed && (
                <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              )}
            </button>

            {/* Back to Site */}
            <Link
              to="/"
              title={isCollapsed ? "Back to Site" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-bg-secondary hover:text-text",
                isCollapsed && "justify-center px-2",
              )}
            >
              <Home className="h-5 w-5" />
              {!isCollapsed && <span>Back to Site</span>}
            </Link>

            {/* Logout (Optional, assuming nice to have here) */}
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title={isCollapsed ? "Logout" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-bg-secondary hover:text-error",
                isCollapsed && "justify-center px-2",
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="h-screen flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--color-bg-card)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
          },
          success: {
            iconTheme: {
              primary: "var(--color-success)",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-error)",
              secondary: "white",
            },
          },
        }}
      />
    </div>
  );
}
