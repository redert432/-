import React from 'react';

const ModernSky: React.FC = () => {
  // Generate multiple star elements with random positions and animation delays
  const stars = Array.from({ length: 50 }).map((_, i) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${2 + Math.random() * 8}s`,
    };
    return <div key={i} className="shooting-star" style={style}></div>;
  });

  return (
    <div className="modern-sky absolute top-0 left-0 w-full h-full overflow-hidden">
      {stars}
      <style>{`
        .shooting-star {
          position: absolute;
          width: 2px;
          height: 80px;
          background: linear-gradient(to top, transparent, rgba(var(--color-text-accent), 0.7));
          border-radius: 50%;
          animation: shoot 5s linear infinite;
          transform: rotate(45deg);
        }
        @keyframes shoot {
          0% {
            transform: rotate(45deg) translateY(50vh);
            opacity: 1;
          }
          100% {
            transform: rotate(45deg) translateY(-50vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernSky;
