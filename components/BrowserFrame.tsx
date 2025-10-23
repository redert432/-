import React from 'react';
import { Favorite } from '../types';

interface BrowserFrameProps {
  query: string;
  children: React.ReactNode;
  onAddToFavorites: (item: Favorite) => void;
}

const BrowserFrame: React.FC<BrowserFrameProps> = ({ query, children, onAddToFavorites }) => {
  const url = `https://najdi.com/search?q=${encodeURIComponent(query)}`;

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // FIX: Clone the child element and pass down the `onAddToFavorites` handler and `query`.
      // This allows the child component (`SearchResults`) to trigger the favorite action.
      return React.cloneElement(child, { onAddToFavorites, query } as any);
    }
    return child;
  });

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl bg-[#2d3748] border border-[rgba(var(--color-border),0.3)] slide-down-fade-in">
      {/* Browser Header */}
      <div className="flex items-center p-3 bg-[rgba(var(--color-bg-muted),0.5)] rounded-t-xl border-b border-[rgba(var(--color-border),0.2)]">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-grow mx-4">
          <div className="bg-[rgba(var(--color-bg-main),0.8)] text-[rgb(var(--color-text-main))] text-sm rounded-md px-4 py-1 text-center truncate">
            {url}
          </div>
        </div>
      </div>
      {/* Browser Content */}
      <div className="bg-[rgb(var(--color-bg-content-trans))] text-[rgb(var(--color-text-content))] rounded-b-xl overflow-hidden">
        {childrenWithProps}
      </div>
    </div>
  );
};

export default BrowserFrame;