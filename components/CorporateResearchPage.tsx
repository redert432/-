import React, { useState, useCallback } from 'react';
import { Page } from '../App';
import { ProjectFile } from '../types';
import { performSearch } from '../services/geminiService';
import NajdiLogo from './NajdiLogo';

interface CorporateResearchPageProps {
  onNavigate: (page: Page) => void;
  onSaveToProjectSpace: (file: Omit<ProjectFile, 'id' | 'createdAt'>) => boolean;
}

const formatReportToHtml = (markdown: string) => {
    const lines = markdown.split('\n');
    let html = '';
    let inTable = false;
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (!line) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += '<br />';
            continue;
        }

        if (line.startsWith('|')) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (!inTable) {
                inTable = true;
                html += '<table class="w-full my-4 text-right border-collapse">';
                const headerCells = line.slice(1, -1).split('|').map(c => c.trim());
                html += '<thead><tr class="border-b-2 border-[rgb(var(--color-border))] bg-white/50">';
                headerCells.forEach(c => html += `<th class="p-3 font-bold text-[rgb(var(--color-text-accent-strong))]">${c}</th>`);
                html += '</tr></thead><tbody>';
                i++; 
            } else {
                const bodyCells = line.slice(1, -1).split('|').map(c => c.trim());
                html += '<tr class="border-b border-slate-200 hover:bg-slate-100">';
                bodyCells.forEach(c => html += `<td class="p-3">${c}</td>`);
                html += '</tr>';
            }
        } else {
            if (inTable) {
                inTable = false;
                html += '</tbody></table>';
            }
            if (line.startsWith('* ')) {
                if (!inList) {
                    inList = true;
                    html += '<ul class="list-disc list-outside mr-6 space-y-2">';
                }
                html += `<li>${line.substring(2)}</li>`;
            } else {
                 if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (line.startsWith('## ')) {
                    html += `<h2 class="text-2xl font-bold mt-6 mb-3 text-[rgb(var(--color-text-accent-strong))] border-b-2 border-[rgba(var(--color-border),0.4)] pb-2">${line.substring(3)}</h2>`;
                } else if (line.startsWith('### ')) {
                     html += `<h3 class="text-xl font-bold mt-4 mb-2 text-[rgb(var(--color-text-content))]">${line.substring(4)}</h3>`;
                } else {
                    html += `<p class="my-2">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
                }
            }
        }
    }

    if (inTable) html += '</tbody></table>';
    if (inList) html += '</ul>';
    
    return { __html: html.replace(/<br \/>/g, '') };
};


const CorporateResearchPage: React.FC<CorporateResearchPageProps> = ({ onNavigate, onSaveToProjectSpace }) => {
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!companyName.trim()) {
        setError('يرجى إدخال اسم الشركة.');
        return;
    };
    
    setIsLoading(true);
    setReport(null);
    setError(null);

    try {
      const result = await performSearch(companyName, 'corporate-research');
      setReport(result.text);
    } catch (e) {
      console.error(e);
      setError('عذرًا، حدث خطأ أثناء إنشاء التقرير.');
    } finally {
      setIsLoading(false);
    }
  }, [companyName]);

  const handleSave = () => {
    if (!report) return;
    const success = onSaveToProjectSpace({
        name: `تحليل-${companyName.replace(/ /g, '_')}.txt`,
        type: 'txt',
        content: report,
        size: new Blob([report]).size,
    });
    if (success) {
        alert('تم حفظ التقرير بنجاح في مساحة المشاريع!');
    }
  };

  return (
    <main className="relative z-10 w-full flex flex-col items-center min-h-screen px-4 py-24">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-10 slide-down-fade-in">
          <NajdiLogo variant="title" />
          <h1 className="text-4xl md:text-5xl font-bold themed-glow" style={{ letterSpacing: '0.1em' }}>
            مركز تحليل الشركات
          </h1>
          <p className="text-[rgb(var(--color-text-muted))] text-lg mt-4 max-w-2xl mx-auto">
            احصل على تقارير تحليلية معمقة للشركات العالمية بضغطة زر.
          </p>
        </div>

        <div className="p-8 bg-[rgba(var(--color-bg-content-trans),0.8)] rounded-xl shadow-xl border border-[rgba(var(--color-border),0.2)] fade-in">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="مثال: Apple Inc., Saudi Aramco, Microsoft"
              disabled={isLoading}
              className="flex-grow w-full p-4 text-lg bg-white/80 text-[rgb(var(--color-text-content))] border-2 border-[rgba(var(--color-border),0.5)] rounded-full focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] focus:border-[rgb(var(--color-border))] transition-all duration-300 shadow-inner"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !companyName.trim()}
              className="w-full sm:w-auto px-10 py-4 bg-[rgb(var(--color-bg-accent-primary))] text-[rgb(var(--color-text-on-accent))] text-lg rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] transition-all duration-300 transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white"></div>
                  <span>جاري التحليل...</span>
                </>
              ) : (
                <>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 011.06.44l6.25 6.25a1.5 1.5 0 010 2.12l-2.88 2.88a1.5 1.5 0 01-2.12 0l-1.06-1.06-4.88-4.88a1.5 1.5 0 010-2.12l1.06-1.06a1.5 1.5 0 012.12 0L10 5.56l1.06-1.06a1.5 1.5 0 012.12 0l.71.71-5.66 5.66-2.12-2.12 4.24-4.24-.71-.71A1.5 1.5 0 0110 3.5zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" /></svg>
                  <span>إنشاء تقرير</span>
                </>
              )}
            </button>
          </div>
          {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md border border-red-300 mt-4">{error}</p>}
        </div>

        {(isLoading || report) && (
             <div className="mt-8 p-8 bg-white rounded-xl shadow-2xl min-h-[50vh]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[rgb(var(--color-text-accent))]"></div>
                        <p className="text-slate-600 text-lg mt-4">يقوم المحلل الذكي بجمع البيانات وتحليلها...</p>
                    </div>
                ) : report && (
                     <div className="prose prose-lg max-w-none text-right">
                         <div className="flex justify-between items-start mb-6">
                            <h1 className="text-4xl font-bold text-[rgb(var(--color-text-accent-strong))] m-0">
                                تقرير تحليلي لـ {companyName}
                            </h1>
                            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" /><path d="M9 13l-2-2 1.41-1.41L9 10.18l3.59-3.59L14 8l-5 5z" /></svg>
                                حفظ في مساحة المشاريع
                            </button>
                         </div>
                         <div dangerouslySetInnerHTML={formatReportToHtml(report)} />
                     </div>
                )}
            </div>
        )}

        <div className="mt-12 text-center">
            <button
                onClick={() => onNavigate('search')}
                className="text-[rgb(var(--color-text-link))] hover:text-[rgb(var(--color-text-link-hover))] hover:underline transition-colors duration-200"
            >
                → العودة إلى صفحة البحث
            </button>
        </div>
      </div>
    </main>
  );
};

export default CorporateResearchPage;