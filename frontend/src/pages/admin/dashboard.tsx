import { useQueries } from "@tanstack/react-query";
import { Link, useLocation } from "react-router";
import { FolderTree, Package, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoriesApi, productsApi, usersApi } from "@/lib";

export function AdminDashboard() {
  const location = useLocation();

  const results = useQueries({
    queries: [
      {
        queryKey: ["admin", "stats", "users"],
        queryFn: () => usersApi.getUsers({ limit: 1 }),
      },
      {
        queryKey: ["admin", "stats", "products"],
        queryFn: () => productsApi.getProducts({ limit: 1, status: "active" }),
      },
      {
        queryKey: ["admin", "stats", "categories"],
        queryFn: () => categoriesApi.getCategories(false),
      },
      {
        queryKey: ["admin", "stats", "upgrades"],
        queryFn: () =>
          usersApi.getUpgradeRequests({ limit: 1, status: "PENDING" }),
      },
    ],
  });

  const [usersQuery, productsQuery, categoriesQuery, upgradesQuery] = results;
  const isLoading = results.some((r) => r.isLoading);

  const stats = {
    totalUsers: usersQuery.data?.meta?.total || 0,
    activeProducts: productsQuery.data?.pagination?.total || 0,
    categories: Array.isArray(categoriesQuery.data)
      ? categoriesQuery.data.length
      : 0,
    pendingUpgrades: upgradesQuery.data?.meta?.total || 0,
  };

  const statItems = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary-light",
    },
    {
      label: "Active Products",
      value: stats.activeProducts,
      icon: Package,
      color: "text-success",
      bgColor: "bg-success-light",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: FolderTree,
      color: "text-info",
      bgColor: "bg-info-light",
    },
    {
      label: "Pending Upgrades",
      value: stats.pendingUpgrades,
      icon: ShieldCheck,
      color: "text-warning",
      bgColor: "bg-warning-light",
    },
  ];

  const quickLinks = [
    { to: "/admin/categories", label: "Manage Categories", icon: FolderTree },
    { to: "/admin/products", label: "Manage Products", icon: Package },
    { to: "/admin/users", label: "Manage Users", icon: Users },
    { to: "/admin/upgrades", label: "Upgrade Requests", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
        <p className="mt-2 text-text-muted">
          Manage your platform's categories, products, and users
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-text">
                  {isLoading ? "..." : stat.value.toLocaleString()}
                </p>
              </div>
              <div className={cn("rounded-xl p-3", stat.bgColor)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-text">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-bg-card p-6 transition-colors hover:bg-bg-secondary",
                location.pathname === link.to &&
                  "border-primary bg-primary-light",
              )}
            >
              <link.icon className="h-6 w-6 text-primary" />
              <span className="font-medium text-text">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
