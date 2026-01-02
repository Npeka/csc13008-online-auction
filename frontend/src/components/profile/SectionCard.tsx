import React from "react";

/**
 * SectionCard
 * A reusable card container with optional header.
 */
export const SectionCard: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="rounded-xl border border-border bg-bg-card p-6">
    {title && <h2 className="mb-4 font-semibold text-text">{title}</h2>}
    {children}
  </div>
);
