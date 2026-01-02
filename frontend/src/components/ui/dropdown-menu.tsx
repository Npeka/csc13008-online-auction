import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children }: any) => {
  const [open, setOpen] = React.useState(false);

  // Need to pass state to children (Trigger and Content)
  // Since Trigger and Content are usually direct children or wrapped,
  // we might need a context. But for simple structure:

  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, { open, setOpen });
      })}
    </div>
  );
};

const DropdownMenuTrigger = ({
  asChild,
  children,
  open,
  setOpen,
  ...props
}: any) => {
  const child = React.Children.only(children) as React.ReactElement;

  return React.cloneElement(child, {
    onClick: (e: any) => {
      (child.props as any).onClick?.(e);
      e.preventDefault();
      setOpen(!open);
    },
    ...props,
  });
};

const DropdownMenuContent = ({
  className,
  align = "center",
  children,
  open,
  setOpen,
  ...props
}: any) => {
  if (!open) return null;
  return (
    <div
      className={cn(
        "bg-popover text-popover-foreground animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 absolute z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      {...props}
    >
      <div onClick={() => setOpen(false)}>{children}</div>
    </div>
  );
};

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; asChild?: boolean }
>(({ className, inset, asChild, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-muted -mx-1 my-1 h-px", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
