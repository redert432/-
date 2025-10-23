
import React, { useState, useCallback } from 'react';
import { Page } from '../App';
import { ProjectFile } from '../types';
import { editSpreadsheetWithAi, detectBiasInSpreadsheet } from '../services/geminiService';
import NajdiLogo from './NajdiLogo';
import SpreadsheetGrid from './SpreadsheetGrid';

interface SpreadsheetPageProps {
  onNavigate: (page: Page) => void;
  onSaveToProjectSpace: (file: Omit<ProjectFile, 'id' | 'createdAt'>) => boolean;
}

const INITIAL_ROWS = 25;
const INITIAL_COLS = 15;

const SpreadsheetPage: React.FC<SpreadsheetPageProps> = ({ onNavigate, onSaveToProjectSpace }) => {
  const [gridData, setGridData] = useState<string[][]>(() => 
    Array.from({ length: INITIAL_ROWS }, () => Array(INITIAL_COLS).fill(''))
  );
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for bias detection
  const [isBiasModalOpen, setIsBiasModalOpen] = useState(false);
  const [biasResult, setBiasResult] = useState<string | null>(null);
  const [isBiasLoading, setIsBiasLoading] = useState(false);


  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setGridData(prevData => {
      const newData = prevData.map(row => [...row]);
      newData[rowIndex][colIndex] = value;
      return newData;
    });
  }, []);

  const handleAiRequest = async () => {
    if (!aiPrompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedData = await editSpreadsheetWithAi(gridData, aiPrompt);
      // Ensure the returned data has a consistent shape
      const maxCols = Math.max(...updatedData.map(row => row.length), INITIAL_COLS);
      const normalizedData = updatedData.map(row => row.concat(Array(maxCols - row.length).fill('')));
      setGridData(normalizedData);
      setAiPrompt('');
    } catch (e) {
      console.error("AI Spreadsheet Error:", e);
      setError("لم يتمكن الذكاء الاصطناعي من تنفيذ طلبك. حاول مرة أخرى بصيغة مختلفة.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectBias = async () => {
    setIsBiasLoading(true);
    setBiasResult(null);
    setIsBiasModalOpen(true);
    try {
        const result = await detectBiasInSpreadsheet(gridData);
        setBiasResult(result);
    } catch (e) {
        setBiasResult("عذرًا، حدث خطأ أثناء تحليل البيانات.");
    } finally {
        setIsBiasLoading(false);
    }
  };

  const addRow = () => {
    const newRow = Array(gridData[0]?.length || INITIAL_COLS).fill('');
    setGridData(prev => [...prev, newRow]);
  };

  const addCol = () => {
    setGridData(prev => prev.map(row => [...row, '']));
  };

  const handleSave = () => {
    const csvContent = gridData.map(row => row.join(',')).join('\n');
    const success = onSaveToProjectSpace({
      name: `جدول-بيانات-${new Date().toLocaleDateString('ar-SA')}.csv`,
      type: 'csv',
      content: csvContent,
      size: new Blob([csvContent]).size,
    });
    if (success) {
      alert('تم حفظ الجدول بنجاح في مساحة المشاريع!');
    }
  };

  return (
    <main className="relative z-10 w-full flex flex-col items-center min-h-screen p-4 pt-24 bg-[rgb(var(--color-bg-content))] text-[rgb(var(--color-text-content))]">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 p-4 bg-white/80 rounded-t-xl border-b-2 border-[rgb(var(--color-border))]">
          <div className="text-center sm:text-right">
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-accent-strong))]">مساحة عمل الجداول الذكية</h1>
            <p className="text-slate-500">أنشئ، عدّل، وحلل بياناتك بقوة الذكاء الاصطناعي.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" /><path d="M9 13l-2-2 1.41-1.41L9 10.18l3.59-3.59L14 8l-5 5z" /></svg>
              حفظ
            </button>
            <button onClick={() => onNavigate('search')} className="px-4 py-2 text-sm text-[rgb(var(--color-text-link))] hover:underline">
              → عودة للبحث
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-2 bg-slate-100 border-b border-slate-300 flex items-center gap-4">
            <button onClick={addRow} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50">إضافة صف</button>
            <button onClick={addCol} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50">إضافة عمود</button>
            <button onClick={handleDetectBias} className="px-3 py-1 text-sm bg-amber-100 border border-amber-300 rounded hover:bg-amber-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.852-1.214 3.488 0l1.574 3.003 3.31 4.78c.636 1.214-.474 2.618-1.744 2.618H4.117c-1.27 0-2.38-1.404-1.744-2.618l3.31-4.78 1.574-3.003zM12 10a1 1 0 11-2 0 1 1 0 012 0zm-1 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                اكتشاف التحيز
            </button>
        </div>

        {/* Spreadsheet */}
        <div className="flex-1 overflow-auto bg-white shadow-inner">
          <SpreadsheetGrid gridData={gridData} onCellChange={handleCellChange} />
        </div>

        {/* AI Command Bar */}
        <div className="p-4 bg-white/80 rounded-b-xl border-t-2 border-[rgb(var(--color-border))]">
            {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}
           <div className="relative flex items-center gap-2">
             <label htmlFor="ai-prompt" className="font-bold text-[rgb(var(--color-text-accent-strong))]">أوامر AI:</label>
             <input
                id="ai-prompt"
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiRequest()}
                placeholder="مثال: رتب حسب العمود B تصاعديًا... أو اسأل: ماذا لو زادت كل القيم في العمود C بنسبة 10%؟"
                disabled={isLoading}
                className="w-full p-3 bg-white border-2 border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]"
             />
             <button
                onClick={handleAiRequest}
                disabled={isLoading || !aiPrompt.trim()}
                className="px-6 py-3 bg-[rgb(var(--color-bg-accent-primary))] text-white font-semibold rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] disabled:bg-slate-400"
             >
                {isLoading ? '...' : 'نفّذ'}
             </button>
           </div>
        </div>

      </div>

      {isBiasModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsBiasModalOpen(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-4">تقرير تحليل التحيز</h2>
                <div className="max-h-[60vh] overflow-y-auto p-4 bg-slate-50 rounded">
                    {isBiasLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-[rgb(var(--color-text-accent))]"></div>
                        </div>
                    ) : (
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: biasResult?.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '' }} />
                    )}
                </div>
                <button onClick={() => setIsBiasModalOpen(false)} className="mt-4 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">إغلاق</button>
            </div>
        </div>
      )}
    </main>
  );
};

export default SpreadsheetPage;
