import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, error, hint, leftIcon, rightIcon, id, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "w-full rounded-lg px-4 py-2.5",
              "border border-border bg-bg-card",
              "text-text placeholder:text-text-muted",
              "transition-colors duration-200",
              "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-error focus:border-error focus:ring-error/20",
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              className,
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted">
                {rightIcon}
              </div>
            )
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-text-muted">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

// TextArea Component
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-text"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-[100px] w-full resize-y rounded-lg px-4 py-2.5",
            "border border-border bg-bg-card",
            "text-text placeholder:text-text-muted",
            "transition-colors duration-200",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:border-error focus:ring-error/20",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-text-muted">{hint}</p>
        )}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
