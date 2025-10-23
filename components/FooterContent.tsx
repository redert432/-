import React from 'react';
import { Favorite } from '../types';

interface FooterContentProps {
  history: string[];
  favorites: Favorite[];
  onHistoryClick: (query: string) => void;
}

const FooterContent: React.FC<FooterContentProps> = ({ history, favorites, onHistoryClick }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 fade-in">
      <div className="flex flex-col items-center justify-center mb-8 text-center text-[rgb(var(--color-text-muted))]">
        <p className="mb-2 text-sm">اسحب للأسفل لرؤية التاريخ والمفضلات</p>
        <svg
          className="w-6 h-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <div className="p-8 bg-[rgba(var(--color-bg-muted),0.3)] rounded-xl border border-[rgba(var(--color-border),0.2)]">
        <h2 className="text-3xl font-bold text-center mb-8 themed-glow">التاريخ والمفضلات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Search History */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[rgb(var(--color-text-accent))]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>
              <span>محفوظات البحث</span>
            </h3>
            {history.length > 0 ? (
              <ul className="space-y-2">
                {history.map((item, index) => (
                  <li key={index}>
                    <button 
                      onClick={() => onHistoryClick(item)}
                      className="w-full text-right p-3 rounded-lg bg-[rgba(var(--color-bg-muted-hover),0.3)] hover:bg-[rgba(var(--color-bg-muted-hover),0.7)] transition-colors text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-main))] flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>
                      <span className="truncate">{item}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[rgb(var(--color-text-muted))]">لا يوجد محفوظات بعد.</p>
            )}
          </div>

          {/* Favorites */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[rgb(var(--color-text-accent))]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span>المفضلات</span>
            </h3>
            {favorites.length > 0 ? (
              <ul className="space-y-3">
                {favorites.map((fav, index) => (
                  <li key={index} className="p-3 rounded-lg bg-[rgba(var(--color-bg-muted-hover),0.3)]">
                    <p className="font-semibold text-[rgb(var(--color-text-main))]">{fav.title}</p>
                    <p className="text-sm text-[rgb(var(--color-text-muted))]">من بحث: "{fav.query}"</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[rgb(var(--color-text-muted))]">لم تقم بإضافة أي شيء للمفضلة.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterContent;