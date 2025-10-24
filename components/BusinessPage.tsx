import React, { useState, useCallback } from 'react';
import { Page } from '../App';
import { BusinessDocument, ProjectFile } from '../types';
import { performSearch } from '../services/geminiService';
import NajdiLogo from './NajdiLogo';

interface BusinessPageProps {
  onNavigate: (page: Page) => void;
  onSaveToProjectSpace: (file: Omit<ProjectFile, 'id' | 'createdAt'>) => boolean;
}

const templates = [
  { 
    title: 'خطة عمل', 
    prompt: 'أنشئ لي هيكل خطة عمل مفصل لشركة ناشئة في مجال التقنية، مع أقسام للملخص التنفيذي، تحليل السوق، المنتجات والخدمات، استراتيجية التسويق، والخطة المالية.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
  },
  { 
    title: 'عرض تقديمي', 
    prompt: 'اكتب محتوى لعرض تقديمي من 10 شرائح حول أهمية التسويق الرقمي للشركات الصغيرة. يجب أن تتضمن الشرائح مقدمة، إحصائيات، استراتيجيات، دراسة حالة، وخاتمة.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
  },
  { 
    title: 'تقرير مالي', 
    prompt: 'أنشئ قالبًا لتقرير مالي ربع سنوي يتضمن ملخص الأداء، قائمة الدخل، الميزانية العمومية، وتدفقات النقد.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11h14a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5a1 1 0 011-1zM2 3h14a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" /></svg>
  },
  { 
    title: 'رسالة بريد إلكتروني', 
    prompt: 'اكتب مسودة بريد إلكتروني احترافي لمتابعة اجتماع عمل ناجح، مع تلخيص النقاط الرئيسية والخطوات التالية.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
  },
  { 
    title: 'محتوى تسويقي', 
    prompt: 'اكتب 3 تغريدات تسويقية جذابة لإطلاق منتج جديد (سماعات لاسلكية)، مع استخدام الهاشتاجات المناسبة.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
  },
  { 
    title: 'وصف وظيفي', 
    prompt: 'أنشئ وصفًا وظيفيًا لمنصب "مدير تسويق رقمي"، يشمل المسؤوليات الرئيسية، المؤهلات المطلوبة، والمهارات.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
  },
];

const BusinessPage: React.FC<BusinessPageProps> = ({ onNavigate, onSaveToProjectSpace }) => {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{title: string, content: string} | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [currentTask, setCurrentTask] = useState('');

  const handleGenerate = useCallback(async (prompt: string, title: string, icon: React.ReactNode) => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setGeneratedContent(null);
    setCurrentTask(`جاري إنشاء: ${title}...`);

    try {
      const result = await performSearch(prompt, 'najd-ai');
      setGeneratedContent({ title, content: result.text });
      
      const newDoc: BusinessDocument = {
        id: Date.now().toString(),
        title,
        content: result.text,
        createdAt: new Date().toLocaleDateString('ar-SA'),
        icon,
      };
      setDocuments(prev => [newDoc, ...prev]);

    } catch (error) {
      console.error(error);
      setGeneratedContent({ title: 'خطأ', content: 'عذرًا، حدث خطأ أثناء إنشاء المستند.' });
    } finally {
      setIsLoading(false);
      setCurrentTask('');
    }
  }, []);

  const handleSave = () => {
    if (!generatedContent) return;
    const success = onSaveToProjectSpace({
        name: `${generatedContent.title}.txt`,
        type: 'txt',
        content: generatedContent.content,
        size: new Blob([generatedContent.content]).size,
    });
    if (success) {
        alert('تم حفظ المستند بنجاح في مساحة المشاريع!');
    }
  };

  return (
    <main className="relative z-10 w-full flex flex-col items-center min-h-screen px-4 py-24">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12 slide-down-fade-in">
          <NajdiLogo variant="title" />
          <h1 className="text-4xl md:text-5xl font-bold themed-glow" style={{ letterSpacing: '0.1em' }}>
            مساحة العمل
          </h1>
          <p className="text-[rgb(var(--color-text-muted))] text-lg mt-4">
            أنشئ مستندات احترافية بسهولة وسرعة مع مساعدك الذكي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Create & View */}
          <div className="space-y-8">
            {/* Templates */}
            <div className="p-8 bg-[rgba(var(--color-bg-content-trans),0.8)] rounded-xl shadow-xl border border-[rgba(var(--color-border),0.2)] fade-in">
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-6">ابدأ بقالب جاهز</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {templates.map(template => (
                  <button
                    key={template.title}
                    onClick={() => handleGenerate(template.prompt, template.title, template.icon)}
                    disabled={isLoading}
                    className="p-4 flex flex-col items-center justify-center text-center bg-white/80 rounded-lg border-2 border-dashed border-[rgba(var(--color-border),0.3)] hover:border-[rgb(var(--color-border))] hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="text-[rgb(var(--color-text-accent))] group-hover:scale-110 transition-transform">{template.icon}</div>
                    <span className="mt-2 font-semibold text-[rgb(var(--color-text-content))] text-sm">{template.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Document */}
            <div className="p-8 bg-[rgba(var(--color-bg-content-trans),0.8)] rounded-xl shadow-xl border border-[rgba(var(--color-border),0.2)] fade-in" style={{animationDelay: '100ms'}}>
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-6">...أو اطلب أي شيء</h2>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="مثال: اكتب لي عقد عمل لمصمم جرافيك..."
                rows={4}
                className="w-full p-3 text-lg bg-white/80 text-[rgb(var(--color-text-content))] border-2 border-[rgba(var(--color-border),0.5)] rounded-lg focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] focus:border-[rgb(var(--color-border))] transition-all duration-300 shadow-inner"
                disabled={isLoading}
              />
              <button
                onClick={() => handleGenerate(customPrompt, 'مستند مخصص', <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>)}
                disabled={isLoading || !customPrompt.trim()}
                className="w-full mt-4 px-8 py-3 bg-[rgb(var(--color-bg-accent-primary))] text-[rgb(var(--color-text-on-accent))] text-lg rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] transition-all duration-300 transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed"
              >
                إنشاء مستند
              </button>
            </div>
            
             {/* My Documents */}
            <div className="p-8 bg-[rgba(var(--color-bg-content-trans),0.8)] rounded-xl shadow-xl border border-[rgba(var(--color-border),0.2)] fade-in" style={{animationDelay: '200ms'}}>
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-6">مستنداتي</h2>
                {documents.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {documents.map(doc => (
                            <div key={doc.id} className="p-4 bg-white rounded-lg flex items-start gap-4 border border-[rgba(var(--color-border),0.2)]">
                                <div className="text-[rgb(var(--color-text-accent))] mt-1">{doc.icon}</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-[rgb(var(--color-text-content))]">{doc.title}</h3>
                                    <p className="text-sm text-slate-500 truncate">{doc.content.substring(0, 100)}...</p>
                                    <p className="text-xs text-slate-400 mt-1">تاريخ الإنشاء: {doc.createdAt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-8">لم تقم بإنشاء أي مستندات بعد.</p>
                )}
            </div>

          </div>
          
          {/* Right Column: Result */}
          <div className="p-8 bg-[rgba(var(--color-bg-content-trans),0.8)] rounded-xl shadow-xl border border-[rgba(var(--color-border),0.2)] h-[80vh] flex flex-col fade-in" style={{animationDelay: '300ms'}}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-accent-strong))] text-center">المستند المُنشأ</h2>
                {generatedContent && (
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" /><path d="M9 13l-2-2 1.41-1.41L9 10.18l3.59-3.59L14 8l-5 5z" /></svg>
                        حفظ في مساحة المشاريع
                    </button>
                )}
            </div>
            <div className="flex-1 bg-white rounded-lg p-6 overflow-y-auto prose prose-lg max-w-none shadow-inner">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[rgb(var(--color-text-accent))]"></div>
                        <p className="text-[rgb(var(--color-text-muted))] text-lg mt-4">{currentTask}</p>
                    </div>
                ) : generatedContent ? (
                    <div
                        className="text-right whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedContent.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM11 15a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM4 15a1 1 0 100 2h3a1 1 0 100-2H4z" /></svg>
                        <p>ستظهر نتائجك هنا بعد الإنشاء.</p>
                    </div>
                )}
            </div>
          </div>
        </div>
        
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

export default BusinessPage;