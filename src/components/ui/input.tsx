import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "h-12 w-full rounded-xl border border-app-line bg-white px-4 text-foreground outline-none transition duration-200 placeholder:text-muted-foreground hover:border-app-border-hover focus:border-app-line-strong focus:ring-4 focus:ring-app-line-strong/10 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/10";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn(inputBase, className)} {...props} />;
});

Input.displayName = "Input";

export type FieldProps = InputProps & {
  label: string;
  hint?: string;
  error?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, id, className, ...props }, ref) => {
    const reactId = useId();
    const inputId = id ?? reactId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="block">
        <label htmlFor={inputId} className="block text-sm font-semibold text-foreground">
          {label}
        </label>
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("mt-2", className)}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Field.displayName = "Field";
