import React from "react";

export interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
  padded?: boolean;
}

export function Panel({
  as: Tag = "section",
  padded = true,
  className = "",
  children,
  ...props
}: PanelProps) {
  return (
    <Tag
      className={`bg-surface-container-lowest border border-[var(--border)] rounded-[var(--radius-md)] ${padded ? "p-5" : ""} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
