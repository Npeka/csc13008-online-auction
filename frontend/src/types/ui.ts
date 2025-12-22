export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "new";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
