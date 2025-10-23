import React from 'react';
import { SearchMode } from '../services/geminiService';

interface LoadingSpinnerProps {
  mode: SearchMode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ mode }) => {
  const getMessage = () => {
    switch (mode) {
      case 'thinking':
        return "...جاري التفكير بعمق";
      case 'gpt-5':
        return "...جاري الاستعانة بالذكاء الاصطناعي المتقدم";
      case 'solid-sonic':
        return "...جاري توليد استجابة سريعة";
      case 'maps':
        return "...جاري البحث عن أماكن";
      case 'web':
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