import React, { useState, useRef, useEffect } from 'react';
import { SearchMode } from '../services/geminiService';
import { Page } from '../App';

interface ThinkingModeSwitchProps {
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  isLoading: boolean;
  onNavigate: (page: Page) => void;
  onAction: (actionId: string) => void;
}

const mainModes: { id: SearchMode | Page | string; label: string; icon: React.ReactElement, isAction?: boolean }[] = [
  {
    id: 'web',
    label: 'بحث عادي',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.527-1.912q.314.17.617.378A6.003 6.003 0 0116 10c0 .357-.02.71-.059 1.052A1.5 1.5 0 0114.5 10c-.828 0-1.5.672-1.5 1.5v.5a2 2 0 00-4 0v-.5A1.5 1.5 0 017.5 10c-.526 0-.988-.27-1.256-.668a6.012 6.012 0 01-1.912-2.706z" clipRule="evenodd" /></svg>
  },
  {
    id: 'trending',
    label: 'الترندات',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>,
    isAction: true,
  },
   {
    id: 'webapp-builder',
    label: 'منشئ التطبيقات',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
  },
   {
    id: 'presentation-builder',
    label: 'منشئ العروض',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
  },
   {
    id: 'word-processor',
    label: 'محرر النصوص',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
  },
  {
    id: 'spreadsheet',
    label: 'الجداول الذكية',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H3zm2 2h2v2H5V5zm4 0h2v2H9V5zm4 0h2v2h-2V5zm-8 4h2v2H5V9zm4 0h2v2H9V9zm4 0h2v2h-2V9zm-8 4h2v2H5v-2zm4 0h2v2H9v-2zm4 0h2v2h-2v-2z" /></svg>
  },
  {
    id: 'thinking',
    label: 'التفكير العميق',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 4a.75.75 0 01.75.75v.5c0 .414.336.75.75.75h.5a.75.75 0 010 1.5h-.5A1.75 1.75 0 0110 5.75v-.5A.75.75 0 0110 4zM8.5 6.25a.75.75 0 00-1.5 0v.5A1.75 1.75 0 008.75 8.5h.5a.75.75 0 000-1.5h-.5a.75.75 0 01-.75-.75v-.5zM10 8a2 2 0 100 4 2 2 0 000-4zM5.25 11.5a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a1.75 1.75 0 01-1.75-1.75v-.5a.75.75 0 01.75-.75zM10 12.25a.75.75 0 01.75.75v.5a1.75 1.75 0 01-1.75 1.75h-.5a.75.75 0 010-1.5h.5a.75.75 0 00.75-.75v-.5a.75.75 0 01.75-.75z" clipRule="evenodd" /><path d="M4 10a6 6 0 1112 0 6 6 0 01-12 0zM2.5 10a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" /></svg>
  },
   {
    id: 'cr',
    label: 'تحليل الشركات',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" /></svg>
  },
  {
    id: 'aigen6',
    label: 'AI Gen 6',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 011.06.44l6.25 6.25a1.5 1.5 0 010 2.12l-2.88 2.88a1.5 1.5 0 01-2.12 0l-1.06-1.06-4.88-4.88a1.5 1.5 0 010-2.12l1.06-1.06a1.5 1.5 0 012.12 0L10 5.56l1.06-1.06a1.5 1.5 0 012.12 0l.71.71-5.66 5.66-2.12-2.12 4.24-4.24-.71-.71A1.5 1.5 0 0110 3.5zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" /></svg>
  },
   {
    id: 'projectspace',
    label: 'مساحة المشاريع',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
  },
  {
    id: 'image',
    label: 'رؤية الذكاء الاصطناعي',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
  },
  {
    id: 'business',
    label: 'أعمالي',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" /></svg>
  },
];

const aiTools: { id: string; label: string; disabled: boolean; modeId?: SearchMode; navTarget?: Page; description: string }[] = [
    { id: 'aigen6-nav', label: 'AI Gen 6 الجيل الجديد', disabled: false, navTarget: 'aigen6', description: 'أقوى أداة ذكاء اصطناعي، الجيل الجديد كلياً.' },
    { id: 'gpt-5', label: 'Gpt-5', disabled: false, modeId: 'gpt-5', description: 'مساعد ذكاء اصطناعي متقدم لإجابات شاملة ومفصلة.' },
    { id: 'solid-sonic', label: 'solid sonic', disabled: false, modeId: 'solid-sonic', description: 'مساعد ذكاء اصطناعي سريع وموجز للحصول على إجابات مباشرة.' },
    { id: 'live', label: 'محادثة مباشرة', disabled: false, navTarget: 'live', description: 'تحدث مع الذكاء الاصطناعي مباشرةً.' },
    { id: 'tts', label: 'مولّد الأصوات', disabled: false, navTarget: 'tts', description: 'حوّل النص إلى كلام مسموع بأصوات متنوعة.' },
    { id: 'speedtest', label: 'اختبار السرعة', disabled: false, navTarget: 'speedtest', description: 'قِس سرعة اتصالك بالإنترنت بدقة.' },
];

const ThinkingModeSwitch: React.FC<ThinkingModeSwitchProps> = ({ mode, onModeChange, isLoading, onNavigate, onAction }) => {
    const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
    const aiMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
                setIsAiMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAiToolSelect = (tool: typeof aiTools[0]) => {
        if (tool.navTarget) {
            onNavigate(tool.navTarget);
        } else if (tool.modeId) {
            onModeChange(tool.modeId);
        }
        setIsAiMenuOpen(false);
    };
    
    const isAiModeActive = ['gpt-5', 'solid-sonic'].includes(mode);
    const navigationPages: Page[] = ['speedtest', 'live', 'tts', 'business', 'aigen6', 'projectspace', 'cr', 'spreadsheet', 'word-processor', 'presentation-builder', 'webapp-builder'];

    return (
        <div className="flex items-center justify-center my-4">
            <div className="flex flex-wrap justify-center p-1 space-x-1 bg-[rgba(var(--color-bg-muted),0.5)] rounded-full" role="group">
                {mainModes.map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                            if (m.isAction) {
                                onAction(m.id as string);
                            } else if (navigationPages.includes(m.id as Page)) {
                                onNavigate(m.id as Page);
                            } else {
                                onModeChange(m.id as SearchMode);
                            }
                        }}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 disabled:cursor-not-allowed m-1 transform active:scale-95 ${
                            mode === m.id
                                ? 'bg-[rgb(var(--color-bg-accent-secondary))] text-[rgb(var(--color-text-on-accent))] shadow'
                                : 'text-[rgba(var(--color-text-main),0.7)] hover:bg-[rgba(var(--color-bg-muted-hover),0.5)] hover:-translate-y-1'
                        }`}
                    >
                        {m.icon}
                        {m.label}
                    </button>
                ))}

                {/* AI Tools Button and Dropdown */}
                <div className="relative" ref={aiMenuRef}>
                    <button
                        type="button"
                        onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 disabled:cursor-not-allowed m-1 transform active:scale-95 ${
                            isAiModeActive
                                ? 'bg-[rgb(var(--color-bg-accent-secondary))] text-[rgb(var(--color-text-on-accent))] shadow'
                                : 'text-[rgba(var(--color-text-main),0.7)] hover:bg-[rgba(var(--color-bg-muted-hover),0.5)] hover:-translate-y-1'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>أدوات AI</span>
                    </button>
                    {isAiMenuOpen && (
                        <div className="absolute bottom-full right-0 mb-2 w-56 bg-[rgba(var(--color-bg-muted),0.9)] backdrop-blur-sm rounded-lg p-2 shadow-lg z-30 fade-in">
                            <ul className="space-y-1">
                                {aiTools.map(tool => (
                                    <li key={tool.id} className="relative group">
                                        <button
                                            onClick={() => handleAiToolSelect(tool)}
                                            disabled={tool.disabled || isLoading}
                                            className={`w-full text-right px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                                                mode === tool.modeId
                                                    ? 'bg-[rgb(var(--color-bg-accent-secondary))] text-[rgb(var(--color-text-on-accent))]'
                                                    : 'text-[rgba(var(--color-text-main),0.8)] hover:bg-[rgba(var(--color-bg-muted-hover),0.7)]'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <span>{tool.label}</span>
                                            {mode === tool.modeId && <span className="text-xs themed-glow">النشط</span>}
                                        </button>
                                        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-60 p-3 bg-[rgba(var(--color-bg-accent-primary),0.98)] text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-40 pointer-events-none text-right">
                                            <p className="font-bold text-[rgb(var(--color-text-main))] border-b border-[rgba(var(--color-border),0.4)] pb-1 mb-1">{tool.label}</p>
                                            <p className="text-xs text-[rgba(var(--color-text-on-accent),0.8)]">{tool.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThinkingModeSwitch;