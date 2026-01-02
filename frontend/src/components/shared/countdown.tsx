import { useEffect,useState } from "react";
import { AlertTriangle,Clock } from "lucide-react";
import { cn, getTimeRemaining } from "@/lib/utils";

export interface CountdownProps {
  endTime: string | Date;
  onExpire?: () => void;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Countdown({
  endTime,
  onExpire,
  showIcon = true,
  size = "md",
  className,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(endTime);
      setTimeLeft(remaining);

      if (remaining.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  const isUrgent = !timeLeft.isExpired && timeLeft.total < 60 * 60 * 1000; // Less than 1 hour
  const isVeryUrgent = !timeLeft.isExpired && timeLeft.total < 10 * 60 * 1000; // Less than 10 minutes

  const sizeStyles = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  if (timeLeft.isExpired) {
    return (
      <span className={cn("text-text-muted", sizeStyles[size], className)}>
        Ended
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center font-medium",
        sizeStyles[size],
        isVeryUrgent && "animate-urgency text-error",
        isUrgent && !isVeryUrgent && "text-warning",
        !isUrgent && "text-text-secondary",
        className,
      )}
    >
      {showIcon &&
        (isVeryUrgent ? (
          <AlertTriangle
            className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")}
          />
        ) : (
          <Clock className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        ))}
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

// Countdown Badge - Compact version for cards
export function CountdownBadge({
  endTime,
  className,
}: {
  endTime: string | Date;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const isUrgent = !timeLeft.isExpired && timeLeft.total < 60 * 60 * 1000;

  if (timeLeft.isExpired) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium",
          "bg-bg-tertiary text-text-muted",
          className,
        )}
      >
        Ended
      </span>
    );
  }

  let display = "";
  if (timeLeft.days > 0) {
    display = `${timeLeft.days}d ${timeLeft.hours}h`;
  } else if (timeLeft.hours > 0) {
    display = `${timeLeft.hours}h ${timeLeft.minutes}m`;
  } else {
    display = `${timeLeft.minutes}m ${timeLeft.seconds}s`;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium",
        isUrgent
          ? "animate-urgency bg-error-light text-error"
          : "bg-primary-light text-primary",
        className,
      )}
    >
      <Clock className="h-3 w-3" />
      {display}
    </span>
  );
}
