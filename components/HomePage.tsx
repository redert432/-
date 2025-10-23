import React from 'react';
import { Page } from '../App';
import NajdiLogo from './NajdiLogo';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-[rgba(var(--color-bg-content),0.8)] border border-[rgba(var(--color-border),0.2)] p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-[rgb(var(--color-border))]">
    <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[rgba(var(--color-border),0.1)] text-[rgb(var(--color-text-accent))]">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-bold text-[rgb(var(--color-text-content))]">{title}</h3>
    <p className="text-[rgb(var(--color-text-content-muted))]">{description}</p>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <main className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4 py-24 slide-down-fade-in">
      <div className="text-center">
        <NajdiLogo isCompact={false} />
        <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--color-text-main))] mt-4">
          أهلاً بك في منصة نجد الذكية
        </h1>
        <p className="mt-4 text-lg text-[rgb(var(--color-text-muted))] max-w-2xl mx-auto">
          اكتشف عالماً من المعرفة بقوة الذكاء الاصطناعي، مصمماً بروح سعودية عصرية.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
        <FeatureCard 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
          title="بحث ذكي"
          description="استخدم أحدث نماذج الذكاء الاصطناعي للحصول على إجابات دقيقة ومدعومة بالمصادر."
        />
        <FeatureCard 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 4.5A2.5 2.5 0 018 2h4a2.5 2.5 0 012.5 2.5v6A2.5 2.5 0 0112 13H8a2.5 2.5 0 01-2.5-2.5v-6zM14 10a1 1 0 00-1-1H7a1 1 0 100 2h6a1 1 0 001-1z" /></svg>}
          title="محادثة مباشرة"
          description="تحدث مع الذكاء الاصطناعي مباشرةً واستمع إلى الردود الصوتية الفورية."
        />
        <FeatureCard 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM10 11a2 2 0 100-4 2 2 0 000 4z" /></svg>}
          title="خرائط نجد"
          description="ابحث عن الأماكن والمعالم بسهولة مع خرائطنا المخصصة للمنطقة."
        />
        <FeatureCard 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>}
          title="أدوات متقدمة"
          description="قِس سرعة اتصالك بالإنترنت وحوّل النصوص إلى كلام مسموع والمزيد."
        />
      </div>

      <div className="mt-12">
        <button
          onClick={() => onNavigate('search')}
          className="px-12 py-4 bg-[rgb(var(--color-bg-accent-primary))] text-[rgb(var(--color-text-on-accent))] text-xl rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          ابدأ البحث الآن
        </button>
      </div>
    </main>
  );
};

export default HomePage;