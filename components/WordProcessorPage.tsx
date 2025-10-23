import React, { useState, useCallback, useRef } from 'react';
import { Page } from '../App';
import { ProjectFile } from '../types';
import { editDocumentWithAi, generateSummary, generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';


interface WordProcessorPageProps {
  onNavigate: (page: Page) => void;
  onSaveToProjectSpace: (file: Omit<ProjectFile, 'id' | 'createdAt'>) => boolean;
}

const WordProcessorPage: React.FC<WordProcessorPageProps> = ({ onNavigate, onSaveToProjectSpace }) => {
  const [title, setTitle] = useState('مستند بدون عنوان');
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    
  );
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleAiEdit = useCallback(async () => {
    if (!aiPrompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedContent = await editDocumentWithAi(content, aiPrompt);
      setContent(updatedContent);
      setAiPrompt('');
    } catch (e) {
      console.error("AI Edit Error:", e);
      setError("لم يتمكن الذكاء الاصطناعي من تنفيذ طلبك. حاول مرة أخرى بصيغة مختلفة.");
    } finally {
      setIsLoading(false);
    }
  }, [content, aiPrompt, isLoading]);

  const handleGenerateAudioSummary = useCallback(async () => {
    if (!content.trim() || isLoading || isAudioLoading) return;
    setIsAudioLoading(true);
    setAudioError(null);

    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }

    try {
        const summary = await generateSummary(content);
        const base64Audio = await generateSpeech(summary, 'Zephyr');

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioContext = audioContextRef.current;
        await audioContext.resume();

        const buffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsAudioLoading(false);
        source.start(0);
        audioSourceRef.current = source;

    } catch (err) {
        setAudioError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setIsAudioLoading(false);
    }
}, [content, isLoading, isAudioLoading]);


  const handleSave = () => {
    const success = onSaveToProjectSpace({
      name: `${title}.txt`,
      type: 'txt',
      content: content,
      size: new Blob([content]).size,
    });
    if (success) {
      alert('تم حفظ المستند بنجاح في مساحة المشاريع!');
    }
  };

  return (
    <main className="relative z-10 w-full flex flex-col items-center min-h-screen p-4 pt-24 bg-[rgb(var(--color-bg-content))] text-[rgb(var(--color-text-content))]">
      <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-7rem)] bg-white rounded-xl shadow-2xl border border-[rgba(var(--color-border),0.3)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b-2 border-slate-200 gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold text-[rgb(var(--color-text-accent-strong))] bg-transparent outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))] rounded px-2 py-1 w-full sm:w-auto"
          />
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button onClick={handleGenerateAudioSummary} disabled={isAudioLoading || !content.trim()} className="px-4 py-2 text-sm bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:bg-slate-400">
                {isAudioLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                        <span>جاري الإنشاء...</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.447-.894L4 6.424v6.152l12.553-4.33a1 1 0 00.894-1.448z" /><path d="M4 12.576V14a1 1 0 001 1h10a1 1 0 001-1v-1.424l-12 4.138A1 1 0 012 16V7.424l2 1.152v3.999z" /></svg>
                        ملخص صوتي
                    </>
                )}
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" /><path d="M9 13l-2-2 1.41-1.41L9 10.18l3.59-3.59L14 8l-5 5z" /></svg>
              حفظ
            </button>
            <button onClick={() => onNavigate('search')} className="px-4 py-2 text-sm text-[rgb(var(--color-text-link))] hover:underline">
              → عودة للبحث
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="ابدأ الكتابة هنا..."
            className="w-full h-full p-6 text-lg leading-relaxed bg-transparent resize-none border-none outline-none focus:outline-none"
          />
        </div>

        {/* AI Command Bar */}
        <div className="p-4 bg-slate-50 border-t-2 border-slate-200 rounded-b-xl">
          {(error || audioError) && <p className="text-red-600 text-sm mb-2 text-center">{error || audioError}</p>}
          <div className="relative flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[rgb(var(--color-text-accent-strong))]" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <input
              id="ai-prompt"
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
              placeholder="اطلب من الذكاء الاصطناعي تعديل النص... مثال: اجعل الفقرة الأولى أكثر إقناعًا"
              disabled={isLoading}
              className="w-full p-3 bg-white border-2 border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]"
            />
            <button
              onClick={handleAiEdit}
              disabled={isLoading || !aiPrompt.trim()}
              className="px-6 py-3 bg-[rgb(var(--color-bg-accent-primary))] text-white font-semibold rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] disabled:bg-slate-400 flex items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
              ) : 'تعديل'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WordProcessorPage;