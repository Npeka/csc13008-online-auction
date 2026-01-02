import { Link, useLocation } from "react-router";
import { FolderTree, Package, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const location = useLocation();

  const stats = [
    {
      label: "Total Users",
      value: "1,234",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary-light",
    },
    {
      label: "Active Products",
      value: "456",
      icon: Package,
      color: "text-success",
      bgColor: "bg-success-light",
    },
    {
      label: "Categories",
      value: "12",
      icon: FolderTree,
      color: "text-info",
      bgColor: "bg-info-light",
    },
    {
      label: "Pending Upgrades",
      value: "8",
      icon: ShieldCheck,
      color: "text-warning",
      bgColor: "bg-warning-light",
    },
  ];

  const quickLinks = [
    { to: "/admin/categories", label: "Manage Categories", icon: FolderTree },
    { to: "/admin/products", label: "Manage Products", icon: Package },
    { to: "/admin/upgrades", label: "Upgrade Requests", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
        <p className="mt-2 text-text-muted">
          Manage your platform's categories, products, and user upgrades
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-text">
                  {stat.value}
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
        <div className="grid gap-4 md:grid-cols-3">
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
