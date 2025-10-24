import React from 'react';
import { SearchMode } from '../services/geminiService';

interface LoadingSpinnerProps {
  mode: SearchMode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ mode }) => {
  const getMessage = () => {
    switch (mode) {
      case 'najd-ai':
        return "...يستحضر نجد AI الحكمة من الرمال الرقمية";
      case 'maps':
        return "...جاري البحث عن أماكن";
      default:
        return "...جاري البحث في رمال نجد";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[rgb(var(--color-text-accent))]"></div>
      <p className="text-[rgb(var(--color-text-muted))] text-lg">{getMessage()}</p>
    </div>
  );
};

export default LoadingSpinner;