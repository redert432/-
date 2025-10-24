

import React, { useState, useCallback, useEffect } from 'react';
import { Page } from '../App';
import { ProjectFile, Slide } from '../types';
import { editPresentationWithAi, generateCounterArguments } from '../services/geminiService';

interface PresentationBuilderPageProps {
  onNavigate: (page: Page) => void;
  onSaveToProjectSpace: (file: Omit<ProjectFile, 'id' | 'createdAt'>) => boolean;
}

const PresentationBuilderPage: React.FC<PresentationBuilderPageProps> = ({ onNavigate, onSaveToProjectSpace }) => {
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', title: 'عنوان العرض التقديمي', content: 'ابدأ بكتابة المحتوى هنا...' }
  ]);
  const [activeSlideId, setActiveSlideId] = useState<string>('1');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for counter-arguments
  const [isCounterArgsModalOpen, setIsCounterArgsModalOpen] = useState(false);
  const [counterArgsResult, setCounterArgsResult] = useState<string | null>(null);
  const [isCounterArgsLoading, setIsCounterArgsLoading] = useState(false);


  const activeSlide = slides.find(s => s.id === activeSlideId);
  const activeSlideIndex = slides.findIndex(s => s.id === activeSlideId);

  useEffect(() => {
    // If active slide is deleted, select the previous one or the first one
    if (!activeSlide && slides.length > 0) {
      setActiveSlideId(slides[Math.max(0, activeSlideIndex - 1)]?.id || slides[0].id);
    }
  }, [slides, activeSlide, activeSlideIndex]);
  
  const handleAiEdit = useCallback(async () => {
    if (!aiPrompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedSlides = await editPresentationWithAi(slides, aiPrompt);
      setSlides(updatedSlides);
      setAiPrompt('');
    } catch (e) {
      console.error("AI Edit Error:", e);
      setError("لم يتمكن الذكاء الاصطناعي من تنفيذ طلبك. حاول مرة أخرى بصيغة مختلفة.");
    } finally {
      setIsLoading(false);
    }
  }, [slides, aiPrompt, isLoading]);

  const handleGenerateCounterArgs = async () => {
    setIsCounterArgsLoading(true);
    setCounterArgsResult(null);
    setIsCounterArgsModalOpen(true);
    try {
        const result = await generateCounterArguments(slides);
        setCounterArgsResult(result);
    } catch (e) {
        setCounterArgsResult("عذرًا، حدث خطأ أثناء إنشاء الحجج المضادة.");
    } finally {
        setIsCounterArgsLoading(false);
    }
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: 'شريحة جديدة',
      content: ''
    };
    setSlides(prev => [...prev, newSlide]);
    setActiveSlideId(newSlide.id);
  };
  
  const updateSlide = (id: string, newTitle: string, newContent: string) => {
    setSlides(prev => prev.map(slide => 
      slide.id === id ? { ...slide, title: newTitle, content: newContent } : slide
    ));
  };
  
  const handleSave = () => {
    const presentationContent = slides.map(slide => `## ${slide.title}\n\n${slide.content}`).join('\n\n---\n\n');
    const presentationTitle = slides[0]?.title || 'عرض-تقديمي';
    const success = onSaveToProjectSpace({
      name: `${presentationTitle.replace(/ /g, '_')}.md`,
      type: 'md',
      content: presentationContent,
      size: new Blob([presentationContent]).size,
    });
    if (success) {
      alert('تم حفظ العرض التقديمي بنجاح في مساحة المشاريع!');
    }
  };


  return (
    <main className="relative z-10 w-full flex flex-col items-center min-h-screen p-4 pt-24 bg-[rgb(var(--color-bg-content))] text-[rgb(var(--color-text-content))]">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-7rem)] bg-white rounded-xl shadow-2xl border border-[rgba(var(--color-border),0.3)]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-slate-200">
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text-accent-strong))]">منشئ العروض التقديمية الذكي</h1>
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

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/4 bg-slate-50 border-l border-slate-200 flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlideId(slide.id)}
                  className={`w-full p-2 rounded-lg text-right border-2 ${activeSlideId === slide.id ? 'bg-amber-50 animated-active-border' : 'border-transparent bg-white hover:border-slate-300'}`}
                >
                  <span className="text-xs text-slate-500">شريحة {index + 1}</span>
                  <p className="font-semibold text-slate-800 truncate">{slide.title}</p>
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-slate-200">
              <button onClick={addSlide} className="w-full p-2 text-sm bg-white border border-slate-300 rounded hover:bg-slate-100">إضافة شريحة</button>
            </div>
          </div>

          {/* Main Editor */}
          <div className="w-2/4 flex flex-col overflow-hidden">
            {activeSlide ? (
              <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateSlide(activeSlide.id, e.target.value, activeSlide.content)}
                  className="text-4xl font-bold mb-4 bg-transparent outline-none border-b-2 border-transparent focus:border-slate-300"
                  placeholder="عنوان الشريحة"
                />
                <textarea
                  value={activeSlide.content}
                  onChange={(e) => updateSlide(activeSlide.id, activeSlide.title, e.target.value)}
                  className="flex-1 w-full text-lg leading-relaxed bg-transparent resize-none outline-none"
                  placeholder="محتوى الشريحة..."
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">اختر شريحة للتحرير أو أضف واحدة جديدة.</div>
            )}
          </div>
          
          {/* AI Assistant */}
          <div className="w-1/4 bg-slate-100 border-r border-slate-200 flex flex-col p-4">
            <h3 className="text-lg font-bold text-[rgb(var(--color-text-accent-strong))] mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              مساعد AI
            </h3>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={5}
              placeholder="اطلب تعديلاً... مثال: اجعل محتوى هذه الشريحة على شكل نقاط، أضف شريحة خاتمة..."
              className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]"
              disabled={isLoading}
            />
            <button
              onClick={handleAiEdit}
              disabled={isLoading || !aiPrompt.trim()}
              className="w-full mt-2 px-4 py-2 bg-[rgb(var(--color-bg-accent-primary))] text-white font-semibold rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] disabled:bg-slate-400 flex items-center justify-center"
            >
              {isLoading ? (
                  <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
              ) : 'تطبيق'}
            </button>
             <button
              onClick={handleGenerateCounterArgs}
              disabled={isLoading}
              className="w-full mt-2 px-4 py-2 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-600 disabled:bg-slate-400 flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-1 1v1a1 1 0 002 0V8a1 1 0 00-1-1zm1 4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>
              إنشاء حجج مضادة
            </button>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
             <div className="mt-4 text-xs text-slate-500">
                <p className="font-bold">أفكار للأوامر:</p>
                <ul className="list-disc list-inside">
                    <li>"لخص محتوى الشريحة الحالية."</li>
                    <li>"أعد صياغة عنوان الشريحة الثانية ليكون جذاباً."</li>
                    <li>"أضف شريحة جديدة بعد الشريحة الحالية عن..."</li>
                    <li>"احذف الشريحة الأخيرة."</li>
                </ul>
            </div>
          </div>
        </div>
      </div>

       {isCounterArgsModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsCounterArgsModalOpen(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-4">الحجج المضادة والأسئلة المحتملة</h2>
                <div className="max-h-[60vh] overflow-y-auto p-4 bg-slate-50 rounded">
                    {isCounterArgsLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-[rgb(var(--color-text-accent))]"></div>
                        </div>
                    ) : (
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: counterArgsResult?.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '' }} />
                    )}
                </div>
                <button onClick={() => setIsCounterArgsModalOpen(false)} className="mt-4 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">إغلاق</button>
            </div>
        </div>
      )}
    </main>
  );
};

export default PresentationBuilderPage;