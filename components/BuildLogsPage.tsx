import React, { useState, useMemo } from 'react';
import { Page } from '../App';

type LogLevel = 'info' | 'warn' | 'error';

interface Log {
  timestamp: string;
  level: LogLevel;
  message: string;
}

const mockLogs: Log[] = [
    { timestamp: '21:34:18.222', level: 'info', message: 'تكوين الجهاز: 2 نواة، 8 جيجابايت' },
    { timestamp: '21:34:18.289', level: 'info', message: '(main. Commit: 4d097b1 :الفرع) - /github.com/redert432 استنساخ' },
    { timestamp: '21:34:18.646', level: 'info', message: 'ذاكرة التخزين المؤقت للبناء السابق غير متوفرة' },
    { timestamp: '21:34:18.808', level: 'info', message: 'تم الانتهاء من الاستنساخ: 518.000 مللي ثانية' },
    { timestamp: '21:34:19.147', level: 'info', message: '"vercel build" تشغيل' },
    { timestamp: '21:34:19.528', level: 'info', message: 'فيرسيل CLI 48.2.9' },
    { timestamp: '21:34:19.895', level: 'info', message: '... تثبيت التبعيات' },
    { timestamp: '21:34:35.048', level: 'warn', message: 'npm warn deprecated node-domexception@1.0.0: استخدم DOMException' },
    { timestamp: '21:34:36.079', level: 'info', message: 'تمت إضافة 91 حزمة في 16 ثانية' },
    { timestamp: '21:34:36.079', level: 'info', message: '14 حزمة تبحث عن التمويل' },
    { timestamp: '21:34:36.079', level: 'info', message: 'npm fund` قم بتشغيل` للحصول على التفاصيل' },
    { timestamp: '21:34:36.114', level: 'error', message: 'تحذير: لم يتم التعرف على إصدار Next.js. تأكد من تعريفه كتبعية للمشروع.' },
    { timestamp: '21:34:36.120', level: 'error', message: 'dev". تأكد أيضًا من تطابق إعداد الدليل الجذر مع دليل ملف package.json.' },
    { timestamp: '21:35:01.450', level: 'info', message: 'تم إنشاء الإنتاج الأمثل بنجاح.' },
    { timestamp: '21:35:02.110', level: 'info', message: 'جمع معلومات الصفحة...' },
    { timestamp: '21:35:05.330', level: 'info', message: 'تم التحقق من صحة الأنواع بنجاح.' },
    { timestamp: '21:35:05.990', level: 'warn', message: 'تحذير: متغير البيئة API_KEY مفقود. قد تفشل بعض الميزات.' },
    { timestamp: '21:35:06.500', level: 'info', message: 'اكتمل التحميل إلى ذاكرة التخزين المؤقت البعيدة.' },
];

const LogEntry: React.FC<{ log: Log }> = ({ log }) => {
    const levelClasses: Record<LogLevel, string> = {
        info: 'text-slate-400',
        warn: 'bg-amber-900/40 text-amber-300',
        error: 'bg-red-900/40 text-red-300',
    };
    return (
        <div className={`flex flex-row-reverse items-start p-1.5 rounded-sm ${levelClasses[log.level]}`}>
            <time className="pr-4 text-slate-500 whitespace-nowrap">{log.timestamp}</time>
            <p className="flex-1 text-right break-words" dir="rtl">{log.message}</p>
        </div>
    );
};


const BuildLogsPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');

    const filteredLogs = useMemo(() => {
        return mockLogs.filter(log => {
            const levelMatch = levelFilter === 'all' || log.level === levelFilter;
            const searchMatch = !searchTerm || log.message.toLowerCase().includes(searchTerm.toLowerCase());
            return levelMatch && searchMatch;
        });
    }, [searchTerm, levelFilter]);

    const levelCounts = useMemo(() => {
        return mockLogs.reduce((acc, log) => {
            acc[log.level] = (acc[log.level] || 0) + 1;
            return acc;
        }, {} as Record<LogLevel, number>);
    }, []);

    const FilterButton: React.FC<{level: LogLevel | 'all', label: string, count: number}> = ({level, label, count}) => (
        <button
            onClick={() => setLevelFilter(level)}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors ${levelFilter === level ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
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
                    <h1 className="text-2xl font-bold text-white">سجلات البناء</h1>
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
                        <FilterButton level="all" label="الكل" count={mockLogs.length} />
                        <FilterButton level="error" label="أخطاء" count={levelCounts.error || 0} />
                        <FilterButton level="warn" label="تحذيرات" count={levelCounts.warn || 0} />
                        <FilterButton level="info" label="معلومات" count={levelCounts.info || 0} />
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 bg-black/30">
                    {filteredLogs.map((log, index) => (
                        <LogEntry key={index} log={log} />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default BuildLogsPage;
