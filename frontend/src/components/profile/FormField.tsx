import React from "react";

/**
 * FormField
 * Reusable label + input/textarea component.
 * Props:
 * - label: field label
 * - children: the input element (input, textarea, select, etc.)
 */
export const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="space-y-1">
    <label className="mb-1.5 block text-sm font-medium text-text">
      {label}
    </label>
    {children}
  </div>
);
