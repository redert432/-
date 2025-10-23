import React from 'react';

interface TrendingSearchesProps {
  onSearch: (query: string) => void;
}

const TRENDING_QUERIES = [
  { query: 'أحدث مشاريع نيوم', icon: '🏙️' },
  { query: 'أفضل المطاعم العائلية في الرياض', icon: '🍔' },
  { query: 'فعاليات موسم جدة القادمة', icon: '🎉' },
  { query: 'أسعار النفط اليوم Brent', icon: '🛢️' },
];

const TrendingSearches: React.FC<TrendingSearchesProps> = ({ onSearch }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 fade-in">
      <h2 className="text-center text-lg font-semibold text-[rgb(var(--color-text-muted))] mb-4">
        عمليات البحث الرائجة
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TRENDING_QUERIES.map(item => (
          <button
            key={item.query}
            onClick={() => onSearch(item.query)}
            className="p-3 text-center rounded-lg bg-[rgba(var(--color-bg-muted),0.3)] border border-[rgba(var(--color-border),0.2)] text-[rgb(var(--color-text-main))] hover:bg-[rgba(var(--color-bg-muted-hover),0.5)] transition-all duration-200 transform hover:scale-105"
          >
            <span className="text-xl block mb-1">{item.icon}</span>
            <span className="text-sm">{item.query}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingSearches;
