import React from 'react';
import { Page, Theme } from '../App';
import NajdiLogo from './NajdiLogo';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, theme, setTheme }) => {

  const handleThemeChange = () => {
    const themes: Theme[] = ['default', 'classic', 'modern', 'interactive-dark', 'blue-purple-interactive'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <header className="absolute top-0 left-0 w-full p-4 z-20">
      <nav className="flex items-center justify-between">
        <NajdiLogo variant="header" onClick={() => onNavigate('home')} />
        <div className="flex items-center space-x-4 space-x-reverse">
            <a 
              href="#" 
              className="text-sm text-[rgba(var(--color-text-main),0.9)] hover:underline" 
              onClick={(e) => {
                e.preventDefault();
                onNavigate('email');
              }}
            >
              بريد نجد
            </a>

            <button 
              className="w-9 h-9 rounded-full bg-[rgb(var(--color-bg-muted))] hover:bg-[rgb(var(--color-bg-muted-hover))] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]"
              aria-label="تغيير النمط"
              onClick={handleThemeChange}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgb(var(--color-text-main))]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a1.5 1.5 0 011.06.44l6.25 6.25a1.5 1.5 0 010 2.12l-2.88 2.88a1.5 1.5 0 01-2.12 0l-1.06-1.06-4.88-4.88a1.5 1.5 0 010-2.12l1.06-1.06a1.5 1.5 0 012.12 0L10 5.56l1.06-1.06a1.5 1.5 0 012.12 0l.71.71-5.66 5.66-2.12-2.12 4.24-4.24-.71-.71A1.5 1.5 0 0110 3.5zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
              </svg>
            </button>
            
            <button 
              className="w-9 h-9 rounded-full bg-[rgb(var(--color-bg-muted))] hover:bg-[rgb(var(--color-bg-muted-hover))] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]"
              aria-label="إدارة الحسابات"
              onClick={(e) => e.preventDefault()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[rgb(var(--color-text-on-accent))]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;