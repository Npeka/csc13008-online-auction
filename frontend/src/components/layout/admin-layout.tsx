import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import {
  FolderTree,
  Home,
  LayoutDashboard,
  Package,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Logo } from "./header/logo";

const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/upgrades", label: "Upgrade Requests", icon: ShieldCheck },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

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
    <div className="min-h-screen bg-bg-secondary">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg-card">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-secondary hover:text-text"
            >
              <Home className="h-4 w-4" />
              Back to Site
            </Link>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light">
                <span className="text-xs font-semibold text-primary">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <span className="font-medium text-text">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border bg-bg-card">
          <nav className="space-y-1 p-4">
            {adminNavItems.map((item) => {
              const isActive =
                location.pathname === item.to ||
                (item.to !== "/admin" && location.pathname.startsWith(item.to));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-muted hover:bg-bg-secondary hover:text-text",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
