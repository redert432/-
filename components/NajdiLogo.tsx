import React from 'react';

interface NajdiLogoProps {
  isCompact?: boolean;
  variant?: 'page' | 'header' | 'title';
  onClick?: () => void;
}

const NajdiLogo: React.FC<NajdiLogoProps> = ({ isCompact = false, variant = 'page', onClick }) => {
  // 'title' variant is just the logo image, so we return null to remove it completely.
  if (variant === 'title') {
    return null;
  }
  
  if (variant === 'header') {
    const content = (
      <div className="flex items-baseline gap-2">
        {/* The image has been removed as per the user's request. */}
        <span
          className="themed-glow font-bold text-[rgb(var(--color-text-main))] text-xl"
          style={{ letterSpacing: '0.05em' }}
        >
          نجد <span className="font-normal opacity-80">الذكية</span>
        </span>
        <span className="text-sm font-mono text-[rgb(var(--color-text-muted))] tracking-widest opacity-70">
            najd smart
        </span>
      </div>
    );
    if (onClick) {
        return (
            <button onClick={onClick} className="focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))] rounded-md p-1">
                {content}
            </button>
        )
    }
    return content;
  }

  // 'page' variant
  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${isCompact ? 'mb-4' : 'mb-8'}`}>
      <div className="flex flex-col items-center">
         {/* The image has been removed as per the user's request. */}
        <span
          className={`themed-glow font-bold text-[rgb(var(--color-text-main))] transition-all duration-500 ${isCompact ? 'text-4xl' : 'text-6xl'}`}
          style={{ letterSpacing: '0.05em' }}
        >
          نجد <span className="font-normal opacity-80">الذكية</span>
        </span>
         <span className={`font-mono text-[rgb(var(--color-text-muted))] tracking-widest transition-all duration-500 ${isCompact ? 'text-sm mt-1' : 'text-base mt-2'}`}>
            najd smart
        </span>
      </div>
    </div>
  );
};

export default NajdiLogo;