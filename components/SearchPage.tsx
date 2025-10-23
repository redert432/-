import React, { useState, useCallback, useEffect } from 'react';
import { SearchMode, performSearch } from '../services/geminiService';
import { SearchResult, Favorite } from '../types';
import NajdiLogo from './NajdiLogo';
import SearchBar from './SearchBar';
import ThinkingModeSwitch from './ThinkingModeSwitch';
import LoadingSpinner from './LoadingSpinner';
import SearchResults from './SearchResults';
import BrowserFrame from './BrowserFrame';
import { Page } from '../App';
import FooterContent from './FooterContent';
import DashboardWidgets from './DashboardWidgets';

interface SearchPageProps {
  onNavigate: (page: Page) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('web');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<{ mimeType: string; data: string } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // --- State with Persistence ---
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('najdiSearchHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    try {
      const saved = localStorage.getItem('najdiFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // --- Effects for Saving to localStorage ---
  useEffect(() => {
    localStorage.setItem('najdiSearchHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('najdiFavorites', JSON.stringify(favorites));
  }, [favorites]);


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.warn('Could not get geolocation:', err.message);
      }
    );
  }, []);

  const handleSearch = useCallback(async (options?: { query?: string, mode?: SearchMode }) => {
    const finalQuery = options?.query ?? query;
    const finalMode = options?.mode ?? searchMode;

    if (isLoading) return;
    if (finalMode === 'image' && !finalQuery.trim() && !image) return;
    if (finalMode !== 'image' && !finalQuery.trim()) return;

    setIsLoading(true);
    setSearchResult(null);
    setError(null);
    if (!hasSearched) {
      setHasSearched(true);
    }
    
    // Pass location only for map searches
    const locationForSearch = finalMode === 'maps' && location ? location : undefined;

    try {
      const result = await performSearch(finalQuery, finalMode, locationForSearch, image);
      if (result) {
        setSearchResult(result);
        if (finalMode !== 'image') {
          setHistory(prev => [finalQuery, ...prev.filter(h => h !== finalQuery)].slice(0, 10));
        }
      } else {
        setError('Received an empty response from the server.');
      }
    } catch (e) {
      setError('Failed to fetch search results. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchMode, isLoading, hasSearched, image, location]);
  
  const handleModeChange = (mode: SearchMode) => {
    if (mode !== 'image') {
      setImage(null);
    }
    setSearchMode(mode);
  };
  
  const handleAction = useCallback((actionId: string) => {
      if (actionId === 'trending') {
        const trendingQuery = "ما هي أهم المواضيع الرائجة حاليًا على بحث جوجل في السعودية؟";
        setQuery(trendingQuery);
        handleSearch({ query: trendingQuery, mode: 'web' });
      }
  }, [handleSearch]);

  const handleAddToFavorites = useCallback((item: Favorite) => {
    setFavorites(prev => {
      if (prev.some(f => f.title === item.title)) {
        return prev;
      }
      return [item, ...prev];
    });
  }, []);

  const handleHistoryClick = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch({ query: historyQuery });
  }, [handleSearch]);

  return (
    <div className={`relative z-10 w-full flex flex-col items-center p-4 transition-all duration-700 ease-in-out min-h-screen pt-24 ${hasSearched ? 'justify-start' : 'justify-center'}`}>
        <div className={`w-full flex flex-col items-center transition-all duration-700 ${hasSearched ? 'mb-4' : 'mb-8'}`}>
          {!hasSearched && <DashboardWidgets location={location} />}
          <NajdiLogo isCompact={hasSearched} />
          <div className="w-full max-w-2xl">
            <SearchBar 
              query={query}
              onQueryChange={setQuery}
              onSearch={() => handleSearch()}
              isLoading={isLoading}
              searchMode={searchMode}
              onImageChange={setImage}
              image={image}
            />
            <ThinkingModeSwitch 
              mode={searchMode}
              onModeChange={handleModeChange}
              isLoading={isLoading}
              onNavigate={onNavigate}
              onAction={handleAction}
            />
          </div>
        </div>
        
        <div className="mt-8 w-full">
          {isLoading && <LoadingSpinner mode={searchMode} />}
          {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
          {searchResult && (
            <>
              <BrowserFrame query={query} onAddToFavorites={handleAddToFavorites}>
                <SearchResults result={searchResult} />
              </BrowserFrame>
              {(history.length > 0 || favorites.length > 0) && (
                <FooterContent 
                  history={history}
                  favorites={favorites}
                  onHistoryClick={handleHistoryClick}
                />
              )}
            </>
          )}
        </div>
      </div>
  );
};

export default SearchPage;
