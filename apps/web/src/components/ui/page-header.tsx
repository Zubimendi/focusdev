import React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 ${className}`}
    >
      <div className="min-w-0">
        <h1 className="font-headline text-2xl md:text-[1.75rem] tracking-tight text-on-surface leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-on-surface-variant max-w-xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
