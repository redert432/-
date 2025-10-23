import React, { useRef } from 'react';
import { SearchMode } from '../services/geminiService';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  searchMode: SearchMode;
  onImageChange: (image: { mimeType: string; data: string } | null) => void;
  image: { mimeType: string; data: string } | null;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, onSearch, isLoading, searchMode, onImageChange, image }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) {
          onImageChange({
            mimeType: file.type,
            data: base64String,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isImageMode = searchMode === 'image';

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isImageMode && image && (
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img src={`data:${image.mimeType};base64,${image.data}`} alt="Upload preview" className="w-24 h-24 object-cover rounded-lg shadow-md" />
            <button
              onClick={() => onImageChange(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-amber-50 hover:bg-red-700 transition-colors"
              aria-label="Remove image"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <div className="relative flex items-center group">
        {isImageMode && (
          <>
            <button
              onClick={triggerFileInput}
              disabled={isLoading}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-[rgb(var(--color-text-accent))] hover:text-[rgb(var(--color-bg-accent-primary-hover))] disabled:text-slate-500 transition-colors"
              aria-label="Upload an image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isImageMode ? "أنشئ صورة، أو ارفع واحدة واسأل عنها..." : "ابحث مع نجد الذكية..."}
          disabled={isLoading}
          className={`w-full py-3 pr-12 ${isImageMode ? 'pl-12' : 'pl-4'} text-lg bg-[rgba(var(--color-bg-content),0.9)] text-[rgb(var(--color-text-content))] border-2 border-[rgba(var(--color-border),0.5)] rounded-full focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] focus:border-[rgb(var(--color-border))] transition-all duration-300 shadow-lg`}
        />
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[rgb(var(--color-bg-accent-primary))] text-[rgb(var(--color-text-on-accent))] rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-300 transform group-hover:scale-110"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;