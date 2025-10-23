import React from 'react';
import { SearchResult, MapSource, WebSource, Favorite } from '../types';

interface SearchResultsProps {
  result: SearchResult;
  onAddToFavorites?: (item: Favorite) => void;
  query?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ result, onAddToFavorites, query }) => {
  const formatText = (text: string) => {
    // Styling for strong tags is now handled globally in index.html
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
    const listItems = html.match(/^\* (.*)/gm);
    if (listItems) {
      const listHtml = '<ul class="list-disc list-inside space-y-2 my-4">' + listItems.map(item => `<li>${item.substring(2)}</li>`).join('') + '</ul>';
      html = html.replace(/^\* (.*)/gm, '');
      html = listHtml + html;
    }
    return { __html: html };
  };
  
  const mapSources = result.sources.filter((s): s is MapSource => s.type === 'maps');
  const webSources = result.sources.filter((s): s is WebSource => s.type === 'web');
  
  const primaryWebSource = webSources.length > 0 ? webSources[0] : null;
  const otherWebSources = webSources.length > 1 ? webSources.slice(1) : [];

  const handleFavoriteClick = () => {
    if (onAddToFavorites && query && primaryWebSource) {
      onAddToFavorites({ title: primaryWebSource.title, query });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[rgb(var(--color-bg-content-trans))] text-[rgb(var(--color-text-content))] p-6 md:p-8">
      
      {result.imageUrl && (
        <div className="mb-8 p-4 bg-white rounded-lg border-2 border-dashed border-[rgba(var(--color-border),0.3)] shadow-md fade-in">
          <h2 className="text-xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-4 text-center">النتيجة الصورية</h2>
          <div className="flex justify-center">
            <img 
              src={result.imageUrl} 
              alt="Generated result from Najdi AI" 
              className="rounded-lg shadow-lg max-w-full h-auto max-h-[60vh] object-contain" 
            />
          </div>
        </div>
      )}

      {mapSources.length > 0 && (
        <div className="mb-8 fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>أماكن تم العثور عليها</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mapSources.map((source, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border-2 border-dashed border-[rgba(var(--color-border),0.3)] shadow-md">
                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-[rgb(var(--color-text-link))] hover:text-[rgb(var(--color-text-link-hover))] hover:underline transition-colors duration-200 block">
                  {source.title}
                </a>
                <p className="text-sm text-green-700 truncate mt-1" dir="ltr">{source.uri.substring(0, 60)}...</p>
                {source.placeAnswerSources?.[0]?.reviewSnippets && (
                  <div className="mt-3 space-y-2">
                    {source.placeAnswerSources[0].reviewSnippets.slice(0, 2).map((review, rIndex) => (
                       <p key={rIndex} className="text-sm text-gray-600 border-r-4 border-[rgba(var(--color-border),0.6)] pr-2 italic">"{review.text}" <span className="font-semibold not-italic">- {review.author}</span></p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {primaryWebSource && (
        <div className="my-8 p-4 border-2 border-dashed border-[rgba(var(--color-border),0.3)] rounded-lg bg-white shadow-md fade-in" style={{ animationDelay: '200ms' }}>
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-bold text-[rgb(var(--color-text-accent))] mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.527-1.912q.314.17.617.378A6.003 6.003 0 0116 10c0 .357-.02.71-.059 1.052A1.5 1.5 0 0114.5 10c-.828 0-1.5.672-1.5 1.5v.5a2 2 0 00-4 0v-.5A1.5 1.5 0 017.5 10c-.526 0-.988-.27-1.256-.668a6.012 6.012 0 01-1.912-2.706z" clipRule="evenodd" /></svg>
                  <span>النتيجة الرئيسية من الويب</span>
                </h2>
                <a href={primaryWebSource.uri} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-[rgb(var(--color-text-link))] hover:text-[rgb(var(--color-text-link-hover))] hover:underline transition-colors duration-200 block">{primaryWebSource.title}</a>
                <p className="text-sm text-green-700 truncate mt-1" dir="ltr">{primaryWebSource.uri}</p>
              </div>
              {onAddToFavorites && (
                <button onClick={handleFavoriteClick} className="p-2 text-slate-400 hover:text-[rgb(var(--color-text-accent))] transition-colors" aria-label="Add to favorites">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </button>
              )}
           </div>
        </div>
      )}

      {result.text && (
        <div className="prose prose-lg max-w-none text-right fade-in" style={{ animationDelay: '300ms' }} dangerouslySetInnerHTML={formatText(result.text)} />
      )}
      
      {otherWebSources.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-dashed border-[rgba(var(--color-border),0.2)] fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-4">مصادر ويب إضافية:</h3>
          <ul className="space-y-3">
            {otherWebSources.map((source, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[rgb(var(--color-text-accent))] pt-1 ml-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg></span>
                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--color-text-link))] hover:text-[rgb(var(--color-text-link-hover))] hover:underline transition-colors duration-200 break-all">{source.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchResults;