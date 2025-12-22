import { cn } from "@/lib/utils";
import type { AvatarSize } from "@/types";

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const initials = fallback ? getInitials(fallback) : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full bg-bg-secondary object-cover",
          sizeStyles[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary font-medium text-white",
        sizeStyles[size],
        className,
      )}
      title={alt}
    >
      {initials}
    </div>
  );
}

// Avatar Group Component
export interface AvatarGroupProps {
  avatars: Array<{ src?: string; alt: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "sm",
  className,
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          fallback={avatar.alt}
          size={size}
          className="ring-2 ring-bg-card"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-bg-tertiary font-medium text-text-secondary ring-2 ring-bg-card",
            sizeStyles[size],
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
