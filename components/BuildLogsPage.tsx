import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Page } from '../App';
import { Log, LogLevel } from '../types';

interface BuildLogsPageProps {
    onNavigate: (page: Page) => void;
    logs: Log[];
    isBuilding: boolean;
    projectName: string | null;
}

const LogEntry: React.FC<{ log: Log }> = ({ log }) => {
    const levelClasses: Record<LogLevel, string> = {
        info: 'text-slate-400',
        warn: 'bg-amber-900/40 text-amber-300',
        error: 'bg-red-900/40 text-red-300',
    };
    const isSuccessMessage = log.message.startsWith('Deployment complete!');
    const finalClasses = isSuccessMessage ? 'bg-green-900/50 text-green-300 font-bold' : levelClasses[log.level];

    return (
        <div className={`flex flex-row-reverse items-start p-1.5 rounded-sm ${finalClasses}`}>
            <time className="pr-4 text-slate-500 whitespace-nowrap">{log.timestamp}</time>
            <p className="flex-1 text-right break-words" dir="rtl">{log.message}</p>
        </div>
    );
};

const BuildLogsPage: React.FC<BuildLogsPageProps> = ({ onNavigate, logs, isBuilding, projectName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const levelMatch = levelFilter === 'all' || log.level === levelFilter;
            const searchMatch = !searchTerm || log.message.toLowerCase().includes(searchTerm.toLowerCase());
            return levelMatch && searchMatch;
        });
    }, [searchTerm, levelFilter, logs]);

    const levelCounts = useMemo(() => {
        return logs.reduce((acc, log) => {
            acc[log.level] = (acc[log.level] || 0) + 1;
            return acc;
        }, {} as Record<LogLevel, number>);
    }, [logs]);

    const FilterButton: React.FC<{level: LogLevel | 'all', label: string, count: number}> = ({level, label, count}) => (
        <button
            onClick={() => setLevelFilter(level)}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors ${levelFilter === level ? 'animated-cyan-gradient text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
            <span>{label}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${level === 'error' ? 'bg-red-500 text-white' : ''} ${level === 'warn' ? 'bg-amber-500 text-black' : ''} ${level === 'info' ? 'bg-slate-500 text-white' : ''} ${level === 'all' ? 'bg-slate-500 text-white' : ''}`}>
                {count}
            </span>
        </button>
    );
    
    return (
        <main className="relative z-10 w-full flex flex-col items-center min-h-screen p-4 pt-24 bg-slate-900 text-white">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-7rem)] bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700 slide-down-fade-in">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <div>
                         <h1 className="text-2xl font-bold text-white">سجلات البناء والنشر</h1>
                         {projectName && (
                             <div className="flex items-center gap-2 mt-1">
                                <span className={`w-3 h-3 rounded-full ${isBuilding ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
                                <span className="text-sm text-slate-400">{isBuilding ? `جاري البناء... (${projectName})` : `اكتمل النشر (${projectName})`}</span>
                             </div>
                         )}
                    </div>
                    <button onClick={() => onNavigate('search')} className="text-sm text-cyan-400 hover:underline">
                        → العودة للبحث
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-slate-700 gap-4">
                     <div className="relative w-full sm:w-auto flex-grow">
                        <input
                            type="text"
                            placeholder="البحث في السجلات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </div>
                     <div className="flex items-center gap-2">
                        <FilterButton level="all" label="الكل" count={logs.length} />
                        <FilterButton level="error" label="أخطاء" count={levelCounts.error || 0} />
                        <FilterButton level="warn" label="تحذيرات" count={levelCounts.warn || 0} />
                        <FilterButton level="info" label="معلومات" count={levelCounts.info || 0} />
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 bg-black/30">
                    {logs.length > 0 ? (
                        filteredLogs.map((log, index) => <LogEntry key={index} log={log} />)
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM2 9a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM2 14a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>
                            <p className="font-sans text-lg">لا توجد سجلات لعرضها.</p>
                            <p className="font-sans text-sm">اذهب إلى <button onClick={() => onNavigate('webapp-builder')} className="text-cyan-400 underline">منشئ تطبيقات الويب</button> لنشر مشروع.</p>
                        </div>
                    )}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </main>
    );
};

export default BuildLogsPage;
