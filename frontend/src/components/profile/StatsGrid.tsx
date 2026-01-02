import React from "react";
import { Link } from "react-router";

/**
 * StatsGrid
 * Displays a grid of statistic cards.
 */
export const StatsGrid: React.FC<{
  stats: Array<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    href: string;
  }>;
}> = ({ stats }) => (
  <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
    {stats.map((stat) => (
      <Link
        key={stat.label}
        to={stat.href}
        className="rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-primary"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-light p-2 text-primary">
            {stat.icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        </div>
      </Link>
    ))}
  </div>
);
