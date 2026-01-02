export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "default"; // Added for compatibility
export type ButtonSize = "sm" | "md" | "lg" | "icon"; // Added icon size

export type BadgeVariant =
  | "default"
  | "secondary" // Added
  | "success"
  | "warning"
  | "error"
  | "info"
  | "new";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
