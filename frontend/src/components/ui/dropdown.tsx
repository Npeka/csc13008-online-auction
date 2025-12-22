import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  onSelect,
  align = "left",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 min-w-[180px] py-1",
            "rounded-lg border border-border bg-bg-card shadow-lg",
            "z-dropdown animate-in fade-in slide-in-from-top-2 duration-150",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                if (!item.disabled) {
                  onSelect(item.value);
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
              className={cn(
                "flex w-full items-center gap-2 px-4 py-2 text-left text-sm",
                "cursor-pointer transition-colors hover:bg-bg-secondary",
                item.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Select Component
export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  disabled,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-4 py-2.5",
            "border border-border bg-bg-card",
            "cursor-pointer text-left transition-colors",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error",
            isOpen && "border-primary ring-2 ring-primary/20",
          )}
        >
          <span className={selectedOption ? "text-text" : "text-text-muted"}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-text-muted transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute top-full right-0 left-0 mt-1 max-h-60 overflow-auto",
              "rounded-lg border border-border bg-bg-card shadow-lg",
              "animate-in fade-in slide-in-from-top-2 z-50 duration-150",
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full cursor-pointer px-4 py-2 text-left text-sm",
                  "transition-colors hover:bg-bg-secondary",
                  option.value === value && "bg-primary-light text-primary",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
    </div>
  );
}
