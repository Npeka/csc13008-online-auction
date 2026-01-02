import { TrendingDown,TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg-card p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-xl bg-primary-light p-3 text-primary">
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? "text-success" : "text-error",
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <h3 className="mb-1 text-3xl font-bold text-text">{value}</h3>
      <p className="text-sm text-text-muted">{title}</p>
      {description && (
        <p className="mt-2 text-xs text-text-muted">{description}</p>
      )}
    </div>
  );
}

// Mini Stat Card
export function MiniStatCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-bg-card p-4",
        className,
      )}
    >
      <div className="rounded-lg bg-primary-light p-2 text-primary">{icon}</div>
      <div>
        <p className="text-xl font-bold text-text">{value}</p>
        <p className="text-xs text-text-muted">{title}</p>
      </div>
    </div>
  );
}

// Stats Grid
export function StatsGrid({
  stats,
  columns = 4,
  className,
}: {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
