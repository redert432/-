import React, { useState } from 'react';
import { Page } from '../App';
import { generateWebApp, WebAppModel } from '../services/geminiService';
import { ProjectFile } from '../types';

interface WebAppBuilderPageProps {
  onNavigate: (page: Page) => void;
  onSaveToProjectSpace: (file: Omit<ProjectFile, 'id' | 'createdAt'>) => boolean;
  onDeploy: (projectName: string) => void;
}

type CodeTab = 'html' | 'css' | 'js';

const MODELS: { id: WebAppModel; label: string; description: string }[] = [
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'نموذج متقدم للمهام المعقدة والتطبيقات الدقيقة.' },
  { id: 'ai-gen-6', label: 'AI Gen 6', description: 'يعتمد على قوة النموذج المتقدم للمهام المعقدة.' },
  { id: 'solid-sonic', label: 'Solid Sonic', description: 'نموذج سريع للمهام البسيطة والتطبيقات الأولية.' }
];

const WebAppBuilderPage: React.FC<WebAppBuilderPageProps> = ({ onNavigate, onSaveToProjectSpace, onDeploy }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ html: string; css: string; js: string } | null>(null);
  const [activeTab, setActiveTab] = useState<CodeTab>('html');
  const [selectedModel, setSelectedModel] = useState<WebAppModel>('gemini-2.5-pro');

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const webApp = await generateWebApp(prompt, selectedModel);
      setResult(webApp);
    } catch (e) {
      console.error(e);
      setError("حدث خطأ أثناء إنشاء التطبيق. حاول مرة أخرى بوصف مختلف.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result[activeTab]);
    alert(`تم نسخ كود ${activeTab.toUpperCase()}!`);
  };

  const createFullHtml = () => {
    if (!result) return '';
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${prompt.substring(0, 50)}</title>
        <style>${result.css}</style>
      </head>
      <body>
        ${result.html}
        <script>${result.js}</script>
      </body>
      </html>
    `;
  };
  
  const handleDownload = () => {
    if (!result) return;
    const fullHtml = createFullHtml();
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSaveToProjectSpace = () => {
    if (!result) return;
    const fullHtml = createFullHtml();
    const success = onSaveToProjectSpace({
      name: `${prompt.substring(0, 30).replace(/ /g, '_')}.html`,
      type: 'text/html',
      content: fullHtml,
      size: new Blob([fullHtml]).size,
    });
    if (success) {
      alert('تم حفظ التطبيق بنجاح في مساحة المشاريع!');
    }
  };

  const handleDeploy = () => {
      if (!result || !prompt) return;
      const projectName = prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'untitled-app';
      onDeploy(projectName);
  }

  const srcDoc = result ? `<html><head><style>${result.css}</style></head><body>${result.html}<script>${result.js}</script></body></html>` : '';

  const currentModelDescription = MODELS.find(m => m.id === selectedModel)?.description;

  return (
    <main className="relative z-10 w-full min-h-screen p-4 sm:p-6 bg-slate-900 text-white">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-8 slide-down-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold themed-glow" style={{ letterSpacing: '0.1em' }}>
            منشئ تطبيقات الويب
          </h1>
          <p className="text-slate-300 text-lg mt-4 max-w-3xl mx-auto">
            حوّل أفكارك إلى تطبيقات ويب تفاعلية. فقط صف ما تريد، ودع الذكاء الاصطناعي يتولى مهمة البرمجة.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="مثال: تطبيق آلة حاسبة بسيطة بأزرار للأرقام والعمليات الحسابية الأساسية"
            rows={3}
            className="w-full p-4 text-lg bg-slate-900 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            disabled={isLoading}
          />
          <div className="my-4 text-center">
            <div className="inline-flex rounded-full bg-slate-900 p-1">
              {MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedModel === model.id
                      ? 'animated-cyan-gradient text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
            {currentModelDescription && <p className="text-xs text-slate-400 mt-2">{currentModelDescription}</p>}
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full px-8 py-4 bg-cyan-500 text-slate-900 text-xl font-bold rounded-full hover:bg-cyan-400 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex justify-center items-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-slate-900"></div>
                <span>جاري بناء التطبيق...</span>
              </>
            ) : (
              'إنشاء التطبيق'
            )}
          </button>
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </div>

        {(isLoading || result) && (
          <div className="mt-8">
            {isLoading && !result ? (
              <div className="flex flex-col items-center justify-center h-96 bg-slate-800/50 rounded-xl">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
                <p className="text-slate-300 text-lg mt-4">يقوم مهندس الذكاء الاصطناعي ببناء تطبيقك وفق أفضل الممارسات...</p>
              </div>
            ) : result && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
                {/* Live Preview */}
                <div className="flex flex-col bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <h2 className="text-2xl font-bold mb-3 text-cyan-400">معاينة حية</h2>
                  <div className="flex-1 bg-white rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={srcDoc}
                      title="Web App Preview"
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-forms"
                    />
                  </div>
                </div>
                {/* Code View */}
                <div className="flex flex-col bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg">
                      <button onClick={() => setActiveTab('html')} className={`px-3 py-1 text-sm rounded ${activeTab === 'html' ? 'animated-cyan-gradient text-white' : 'hover:bg-slate-700'}`}>HTML</button>
                      <button onClick={() => setActiveTab('css')} className={`px-3 py-1 text-sm rounded ${activeTab === 'css' ? 'animated-cyan-gradient text-white' : 'hover:bg-slate-700'}`}>CSS</button>
                      <button onClick={() => setActiveTab('js')} className={`px-3 py-1 text-sm rounded ${activeTab === 'js' ? 'animated-cyan-gradient text-white' : 'hover:bg-slate-700'}`}>JS</button>
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={handleSaveToProjectSpace} className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg flex items-center gap-2" title="حفظ في مساحة المشاريع">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path d="M5 11a1 1 0 00-1 1v2a1 1 0 001 1h10a1 1 0 001-1v-2a1 1 0 00-1-1H5z" /></svg>
                           حفظ
                        </button>
                        <button onClick={handleDownload} className="px-4 py-2 text-sm bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-lg flex items-center gap-2" title="تنزيل كملف HTML">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5% 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" /><path d="M9 13l-2-2 1.41-1.41L9 10.18l3.59-3.59L14 8l-5 5z" /></svg>
                            تنزيل HTML
                        </button>
                        <button onClick={handleCopyCode} className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2" title="نسخ الكود">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2-2H9a2 2 0 01-2-2V9z" /><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H4z" /></svg>
                            نسخ
                        </button>
                     </div>
                  </div>
                  <div className="flex-1 bg-slate-900 rounded-lg overflow-auto">
                    <pre className="p-4 text-sm whitespace-pre-wrap">
                        <code>{result[activeTab]}</code>
                    </pre>
                  </div>
                  <div className="mt-4 text-sm text-slate-400 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-bold text-cyan-400 text-base mb-2">🚀 نشر تطبيقك</h4>
                    <button onClick={handleDeploy} className="w-full p-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
                        النشر على سحابة نجد الذكية (محاكاة)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
            <button
                onClick={() => onNavigate('search')}
                className="text-cyan-400 hover:underline transition-colors"
            >
                → العودة إلى صفحة البحث
            </button>
        </div>
      </div>
    </main>
  );
};

export default WebAppBuilderPage;
