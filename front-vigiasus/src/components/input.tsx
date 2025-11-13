import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Unstyled input primitive.
 * - Keeps behavior minimal and leaves visual styling to the consumer via `className`.
 * - ForwardRef so it works with form libs (React Hook Form, etc.).
 * - Sensible defaults: full-width block element, transparent bg, no outlines.
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          // Minimal, modern baseline – no visual opinion here
          "block w-full bg-transparent px-3 py-2 outline-none",
          // Accessibility/disabled states
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
