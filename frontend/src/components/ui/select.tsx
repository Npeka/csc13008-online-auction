"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Context-based Select implementation
interface SelectContextType {
  value: string;
  label: string;
  onSelect: (value: string, label: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Select = ({
  children,
  value = "",
  onValueChange,
  open: controlledOpen,
  onOpenChange,
}: SelectProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  const onSelect = (newValue: string, label: string) => {
    setSelectedLabel(label);
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{ value, label: selectedLabel, onSelect, open, setOpen }}
    >
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const SelectTrigger = ({
  className,
  children,
  ...props
}: SelectTriggerProps) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectTrigger must be used within Select");

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-border bg-bg-card px-3 py-2 text-sm text-text",
        "ring-offset-background placeholder:text-text-muted",
        "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 opacity-50 transition-transform",
          ctx.open && "rotate-180",
        )}
      />
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue = ({ placeholder }: SelectValueProps) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectValue must be used within Select");

  return (
    <span className={cn("block truncate", !ctx.label && "text-text-muted")}>
      {ctx.label || placeholder}
    </span>
  );
};

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  position?: "popper" | "item-aligned";
}

export const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: SelectContentProps) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectContent must be used within Select");

  if (!ctx.open) return null;

  return (
    <div
      className={cn(
        "absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-bg-card shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className,
      )}
      {...props}
    >
      <div className="max-h-[300px] overflow-y-auto p-1">{children}</div>
    </div>
  );
};

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const SelectItem = ({
  className,
  children,
  value,
  disabled,
  ...props
}: SelectItemProps) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectItem must be used within Select");

  const isSelected = ctx.value === value;
  const label = typeof children === "string" ? children : "";

  return (
    <div
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        ctx.onSelect(value, label);
      }}
      className={cn(
        "relative flex w-full cursor-pointer items-center rounded-sm py-2 pr-2 pl-8 text-sm outline-none select-none",
        "hover:bg-bg-secondary focus:bg-bg-secondary",
        isSelected && "bg-bg-secondary font-medium",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
};
