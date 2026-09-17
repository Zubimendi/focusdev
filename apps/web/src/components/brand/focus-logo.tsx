import React from "react";

type FocusLogoProps = {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  size?: number;
};

/** Custom FocusDev mark: concentric focus rings + soft aperture core */
export default function FocusLogo({
  className = "",
  markClassName = "",
  wordmark = true,
  size = 40,
}: FocusLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={markClassName}
        aria-hidden={wordmark}
        role="img"
        aria-label="FocusDev"
      >
        <circle
          cx="24"
          cy="24"
          r="21"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.35"
        />
        <circle
          cx="24"
          cy="24"
          r="14.5"
          stroke="currentColor"
          strokeWidth="1.75"
          opacity="0.65"
        />
        <path
          d="M24 5.5V10.5M24 37.5V42.5M5.5 24H10.5M37.5 24H42.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="24" cy="24" r="6.5" fill="currentColor" />
        <circle cx="24" cy="24" r="2.5" fill="var(--landing-core, #EEF1F0)" />
      </svg>
      {wordmark && (
        <span
          className="text-[1.35em] font-medium tracking-[-0.03em] leading-none"
          style={{ fontFamily: "var(--font-landing-display), Georgia, serif" }}
        >
          FocusDev
        </span>
      )}
    </div>
  );
}
