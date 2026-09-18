import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({
  label,
  hint,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full h-9 px-3 rounded-md bg-surface-container-lowest border border-[var(--border)] text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60 disabled:cursor-not-allowed read-only:bg-surface-container-low ${error ? "border-error focus:border-error focus:ring-error/15" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-on-surface-variant">{hint}</p>
      )}
    </div>
  );
}
