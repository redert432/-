import React, { useState, useRef, useCallback } from 'react';
import { Page } from '../App';
import DarkWaves from './DarkWaves';
import PulsingStars from './PulsingStars';
import useParallax from '../hooks/useParallax';
import * as geminiService from '../services/geminiService';

interface AiGen6CreativePageProps {
  onNavigate: (page: Page) => void;
}

type CreativeTool = 'web-dev' | 'bg-remover' | 'game-imagineer' | 'product-photos' | 'content-strategist' | 'business-letter';

const TOOLS: { id: CreativeTool; title: string; description: string; icon: React.ReactNode; }[] = [
  {
    id: 'web-dev',
    title: 'مهندس الويب',
    description: 'صِف فكرة تطبيقك، وسأقوم ببنائه لك مع معاينة حية.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
  },
  {
    id: 'bg-remover',
    title: 'فنان الفوتوشوب',
    description: 'أزل خلفيات الصور بضغطة زر للحصول على نتائج احترافية.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
  },
  {
    id: 'game-imagineer',
    title: 'مصمم الألعاب',
    description: 'تخيل فكرة لعبة وسأكتب لك وثيقة تصميم متكاملة.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 7v10zM4 17a1 1 0 001.447.894l4-2A1 1 0 0010 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 004 7v10z" /></svg>
  },
  {
    id: 'product-photos',
    title: 'مصور المنتجات',
    description: 'أنشئ صوراً واقعية واحترافية لمنتجاتك بجودة استوديو.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
  },
  {
    id: 'content-strategist',
    title: 'خبير الشهرة',
    description: 'احصل على خطط محتوى واستراتيجيات نمو لتصبح صانع محتوى ناجح.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
  },
  {
    id: 'business-letter',
    title: 'صانع الخطابات',
    description: 'أنشئ خطابات عمل رسمية ومقنعة لأي غرض، مع تدقيق لغوي ذكي.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
  },
];

const ToolCard: React.FC<{ tool: typeof TOOLS[0]; onSelect: () => void; }> = ({ tool, onSelect }) => (
    <button
        onClick={onSelect}
        className="bg-[rgba(var(--color-bg-muted),0.4)] border-2 border-transparent hover:border-[rgb(var(--color-ring))] p-6 rounded-xl shadow-lg transition-all duration-300 text-right group transform hover:-translate-y-2"
    >
        <div className="flex items-center justify-between">
            <div className="text-[rgb(var(--color-text-main))] group-hover:text-[rgb(var(--color-ring))] transition-colors">{tool.icon}</div>
            <h3 className="text-2xl font-bold text-white">{tool.title}</h3>
        </div>
        <p className="mt-2 text-slate-400">{tool.description}</p>
    </button>
);

const AiGen6CreativePage: React.FC<AiGen6CreativePageProps> = ({ onNavigate }) => {
    const [activeTool, setActiveTool] = useState<CreativeTool | null>(null);
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<{ mimeType: string; data: string; preview: string } | null>(null);
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const parallaxOffset = useParallax(20);

    const handleToolSelect = (toolId: CreativeTool) => {
        setActiveTool(toolId);
        setResult(null);
        setPrompt('');
        setImage(null);
        setError(null);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result?.toString().split(',')[1];
                if (base64String) {
                    setImage({ mimeType: file.type, data: base64String, preview: URL.createObjectURL(file) });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!prompt && !image) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            let res;
            switch (activeTool) {
                case 'web-dev':
                    // FIX: The `generateWebApp` function expects two arguments: a prompt and a model alias.
                    // Using 'gemini-2.5-pro' as the model for this advanced creative task.
                    res = await geminiService.generateWebApp(prompt, 'gemini-2.5-pro');
                    break;
                case 'bg-remover':
                    if (image) res = await geminiService.removeImageBackground(image);
                    else throw new Error("يرجى رفع صورة أولاً.");
                    break;
                case 'game-imagineer':
                    res = (await geminiService.performSearch(prompt, 'game-design')).text;
                    break;
                case 'product-photos':
                    res = await geminiService.generateProductImage(prompt);
                    break;
                case 'content-strategist':
                    res = (await geminiService.performSearch(prompt, 'content-strategy')).text;
                    break;
                case 'business-letter':
                    res = (await geminiService.performSearch(prompt, 'business-letter')).text;
                    break;
            }
            setResult(res);
        } catch (e: any) {
            setError(e.message || "حدث خطأ غير متوقع.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderResult = () => {
        if (!result) return null;
        switch (activeTool) {
            case 'web-dev':
                const srcDoc = `<html><head><style>${result.css}</style></head><body>${result.html}<script>${result.js}<\/script></body></html>`;
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[60vh]">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold mb-2">معاينة حية</h3>
                            <iframe srcDoc={srcDoc} title="Web App Preview" className="w-full h-full border-2 border-slate-600 rounded-lg bg-white" sandbox="allow-scripts allow-forms" />
                        </div>
                        <div className="flex flex-col">
                             <h3 className="text-lg font-bold mb-2">الكود</h3>
                             <div className="bg-slate-900 rounded-lg overflow-auto h-full p-4 text-sm font-mono border border-slate-600">
                                 <h4 className="font-bold text-cyan-400">HTML</h4>
                                 <pre className="whitespace-pre-wrap text-slate-300"><code>{result.html}</code></pre>
                                 <h4 className="font-bold text-cyan-400 mt-4">CSS</h4>
                                 <pre className="whitespace-pre-wrap text-slate-300"><code>{result.css}</code></pre>
                                  <h4 className="font-bold text-cyan-400 mt-4">JS</h4>
                                 <pre className="whitespace-pre-wrap text-slate-300"><code>{result.js}</code></pre>
                             </div>
                        </div>
                    </div>
                );
            case 'bg-remover':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center">
                            <h3 className="font-bold mb-2">الأصلية</h3>
                            <img src={image?.preview} alt="Original" className="rounded-lg shadow-md max-h-80 mx-auto" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold mb-2">بعد الإزالة</h3>
                            <img src={result} alt="Result" className="rounded-lg shadow-md max-h-80 mx-auto" />
                        </div>
                    </div>
                );
            case 'product-photos':
                 return (
                    <div className="text-center">
                        <img src={result} alt="Generated Product" className="rounded-lg shadow-xl max-h-[60vh] mx-auto" />
                    </div>
                );
            case 'game-imagineer':
            case 'content-strategist':
            case 'business-letter':
                return <div className="prose prose-invert max-w-none text-right whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-6 mb-3 text-cyan-400">$1</h2>').replace(/\n/g, '<br />')}}/>
        }
    };


    const renderToolInterface = () => {
        const currentTool = TOOLS.find(t => t.id === activeTool);
        if (!currentTool) return null;
        
        const showPromptInput = ['web-dev', 'game-imagineer', 'product-photos', 'content-strategist', 'business-letter'].includes(activeTool as CreativeTool);
        const showImageInput = activeTool === 'bg-remover';

        return (
            <div className="w-full max-w-6xl mx-auto bg-[rgba(var(--color-bg-muted),0.6)] backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-[rgb(var(--color-border))] fade-in">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setActiveTool(null)} className="text-slate-300 hover:text-white">&larr; العودة للأدوات</button>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-white">{currentTool.title}</h2>
                        <span className="text-[rgb(var(--color-ring))]">{currentTool.icon}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {showPromptInput && <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="اكتب طلبك هنا..." rows={4} className="w-full p-3 text-lg bg-slate-900/80 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))] transition" />}
                    {showImageInput && (
                        <div className="flex items-center justify-center w-full">
                           <button onClick={() => fileInputRef.current?.click()} className="w-full p-8 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-[rgb(var(--color-ring))] hover:text-white transition-colors">
                                {image ? <img src={image.preview} alt="Preview" className="h-24 mx-auto rounded"/> : "انقر لرفع صورة"}
                           </button>
                           <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
                        </div>
                    )}
                     <button onClick={handleGenerate} disabled={isLoading || (!prompt && !image)} className="w-full px-8 py-3 bg-[rgb(var(--color-ring))] text-black text-lg font-bold rounded-full hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-[rgb(var(--color-ring))] transition disabled:bg-slate-500 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                        {isLoading ? <><div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-black"></div> جاري الإبداع...</> : "أنشئ الآن"}
                    </button>
                </div>
                
                {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}

                {(isLoading || result) && (
                    <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-700">
                        {isLoading && !result ? (
                             <div className="flex flex-col items-center justify-center h-64">
                                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[rgb(var(--color-ring))]"></div>
                                <p className="text-slate-300 text-lg mt-4">الذكاء الاصطناعي يبدع من أجلك...</p>
                            </div>
                        ) : renderResult()}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full overflow-y-auto bg-[#0a0f1e] text-white">
            <div className="absolute top-[-5%] left-[-5%] w-[110%] h-[110%] z-0 transition-transform duration-300 ease-out" style={{ transform: `translateX(${parallaxOffset.x}px) translateY(${parallaxOffset.y}px)` }}>
                <DarkWaves />
                <PulsingStars />
            </div>
             <main className="relative z-10 w-full flex flex-col items-center px-4 py-8 sm:py-16">
                 {activeTool ? renderToolInterface() : (
                    <div className="text-center slide-down-fade-in">
                        <h1 className="text-4xl md:text-6xl font-bold themed-glow" style={{ letterSpacing: '0.1em' }}>ورشة الإبداع</h1>
                        <p className="text-slate-300 text-lg mt-4 max-w-2xl mx-auto">مساحتك الكاملة للابتكار. اختر أداة وانطلق في رحلة الإبداع مع الذكاء الاصطناعي.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
                            {TOOLS.map(tool => <ToolCard key={tool.id} tool={tool} onSelect={() => handleToolSelect(tool.id)} />)}
                        </div>
                    </div>
                 )}

                 <div className="mt-12 text-center">
                    <button onClick={() => onNavigate('search')} className="text-cyan-400 hover:underline transition-colors text-sm">
                        → العودة إلى صفحة البحث الرئيسية
                    </button>
                </div>
             </main>
        </div>
    );
};

export default AiGen6CreativePage;
