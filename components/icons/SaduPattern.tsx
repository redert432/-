import React from 'react';

const SaduPattern: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 20"
    preserveAspectRatio="none"
  >
    <defs>
      <pattern id="sadu" patternUnits="userSpaceOnUse" width="20" height="20">
        <g className="fill-current text-[rgba(var(--color-border),0.5)]">
          <path d="M0 0 H20 V20 H0 Z" fillOpacity="0.1" className="text-[rgb(var(--color-text-main))]" />
          <path d="M5 0 L10 5 L5 10 L0 5 Z" />
          <path d="M15 0 L20 5 L15 10 L10 5 Z" />
          <path d="M5 10 L10 15 L5 20 L0 15 Z" />
          <path d="M15 10 L20 15 L15 20 L10 15 Z" />
        </g>
      </pattern>
    </defs>
    <rect width="100" height="20" fill="url(#sadu)" />
  </svg>
);

export default SaduPattern;