"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// Since we might not have radix-ui installed, implementing a custom Select that mimics the API
// This is a simplified version to avoid dependency install issues
// If radix is available, we should use it. For now, mocking the composition API.

/* 
   NOTE: Given I cannot install packages easily without user permission and waiting,
   I will adapt the CreateProductPage to use the simple native/custom Select if Radix is missing.
   But to support the "Select, SelectContent" syntax, I need a context-based implementation.
*/

// Minimal Context-based Select implementation
const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export const Select = ({
  children,
  value,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
}: any) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ className, children, ...props }: any) => {
  const { open, setOpen } = React.useContext(SelectContext)!;
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ placeholder }: any) => {
  const { value } = React.useContext(SelectContext)!;
  // This is a limitation of this mock: we can't easily show the label instead of value without more complex state
  // But for now it's better than crashing.
  // Ideally we should traverse children to find the selected label.
  return <span className="block truncate">{value || placeholder}</span>;
};

export const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: any) => {
  const { open, setOpen } = React.useContext(SelectContext)!;

  if (!open) return null;

  return (
    <div
      className={cn(
        "bg-popover text-popover-foreground animate-in fade-in-80 absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md",
        position === "popper" && "translate-y-1",
        className,
      )}
      {...props}
    >
      <div className="w-full p-1" onClick={() => setOpen(false)}>
        {children}
      </div>
    </div>
  );
};

export const SelectItem = ({ className, children, value, ...props }: any) => {
  const { onValueChange, value: selectedValue } =
    React.useContext(SelectContext)!;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onValueChange(value);
      }}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selectedValue === value && "bg-accent",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selectedValue === value && <Check className="h-4 w-4" />}
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
};
