import React from 'react';

const PulsingStars: React.FC = () => {
  const stars = Array.from({ length: 100 }).map((_, i) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${2 + Math.random() * 5}s`,
      width: `${1 + Math.random()}px`,
      height: `${1 + Math.random()}px`,
    };
    return <div key={i} className="pulsing-star" style={style}></div>;
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      {stars}
      <style>{`
        .pulsing-star {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default PulsingStars;
