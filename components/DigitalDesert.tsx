import React from 'react';
import DesertNightSky from './DesertNightSky';
import SaduPattern from './icons/SaduPattern';
import useParallax from '../hooks/useParallax';
import { Theme } from '../App';
import BlueWaves from './BlueWaves';
import ModernSky from './ModernSky';
import InteractiveDarkBackground from './InteractiveDarkBackground';

interface DigitalDesertProps {
  theme: Theme;
}

const DigitalDesert: React.FC<DigitalDesertProps> = ({ theme }) => {
  // قوة التأثير: رقم أكبر يعني حركة أكثر وضوحًا
  const parallaxOffset = useParallax(30);

  const renderBackground = () => {
    switch (theme) {
      case 'classic':
        return <BlueWaves />;
      case 'modern':
        return <ModernSky />;
       case 'interactive-dark':
       case 'blue-purple-interactive':
        return <InteractiveDarkBackground />;
      case 'default':
      default:
        return <DesertNightSky />;
    }
  };

  return (
    <div 
      className="absolute top-[-5%] left-[-5%] w-[110%] h-[110%] z-0 transition-transform duration-300 ease-out"
      style={{
        transform: `translateX(${parallaxOffset.x}px) translateY(${parallaxOffset.y}px)`,
      }}
    >
      {renderBackground()}
      {theme === 'default' && (
        <>
          <div className="absolute bottom-0 left-0 w-full h-1/5 bg-gradient-to-t from-[rgba(var(--color-text-accent-strong),0.5)] to-transparent" />
          <SaduPattern className="absolute bottom-0 left-0 w-full h-8 opacity-30" />
        </>
      )}
    </div>
  );
};

export default DigitalDesert;