import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/types";

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-tertiary text-text-secondary",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  error: "bg-error-light text-error",
  info: "bg-info-light text-info",
  new: "bg-cta text-white animate-pulse",
};

export function Badge({
  variant = "default",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Role Badge Component
export function RoleBadge({
  role,
}: {
  role: "guest" | "bidder" | "seller" | "admin";
}) {
  const roleConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    guest: { label: "Guest", variant: "default" },
    bidder: { label: "Bidder", variant: "info" },
    seller: { label: "Seller", variant: "success" },
    admin: { label: "Admin", variant: "warning" },
  };

  const config = roleConfig[role];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Status Badge Component
export function StatusBadge({
  status,
}: {
  status: "active" | "ended" | "sold" | "cancelled";
}) {
  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> =
    {
      active: { label: "Active", variant: "success" },
      ended: { label: "Ended", variant: "default" },
      sold: { label: "Sold", variant: "info" },
      cancelled: { label: "Cancelled", variant: "error" },
    };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
