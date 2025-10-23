import React, { useRef, useCallback, useState } from 'react';
import { ProjectFile } from '../types';
import NajdiLogo from './NajdiLogo';

interface ProjectSpacePageProps {
  files: ProjectFile[];
  onAddFile: (file: Omit<ProjectFile, 'id' | 'createdAt'>) => boolean;
  storageUsed: number;
  maxStorage: number;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
    const fileType = type.toLowerCase();
    if (fileType.includes('pdf')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 14V4h12v12H4z" clipRule="evenodd" /><path d="M10 14a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z" /><path d="M7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" /></svg>;
    if (fileType.includes('doc')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 14V4h12v12H4z" clipRule="evenodd" /><path d="M7 9h6v2H7V9z" /><path d="M7 6h6v2H7V6z" /><path d="M7 12h6v2H7v-2z" /></svg>;
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>;
    if (fileType.includes('txt') || fileType.includes('csv') || fileType.includes('md')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
};

const PreviewContent: React.FC<{ file: ProjectFile }> = ({ file }) => {
    if (!file.content) {
        return <p className="text-slate-500">لا يتوفر محتوى للمعاينة.</p>;
    }
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) {
        return <img src={file.content} alt={file.name} className="max-w-full max-h-[80vh] object-contain rounded-lg" />;
    }
    if (type.startsWith('video/')) {
        return <video src={file.content} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg" />;
    }
     if (type.startsWith('audio/')) {
        return <audio src={file.content} controls autoPlay className="w-full" />;
    }
    if (type.startsWith('text/') || type.includes('csv') || type.includes('md')) {
        return <pre className="w-full h-full bg-slate-100 p-4 rounded-lg text-sm whitespace-pre-wrap overflow-auto">{file.content}</pre>;
    }
    return <p>لا يمكن معاينة هذا النوع من الملفات: {file.type}</p>;
};


const ProjectSpacePage: React.FC<ProjectSpacePageProps> = ({ files, onAddFile, storageUsed, maxStorage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewingFile, setPreviewingFile] = useState<ProjectFile | null>(null);
    
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = event.target.files;
        if (uploadedFiles) {
            for (const file of uploadedFiles) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    onAddFile({
                        name: file.name,
                        type: file.type || 'unknown',
                        size: file.size,
                        content: content,
                    });
                };
                // Read all files as Data URLs for consistent handling in preview
                reader.readAsDataURL(file);
            }
        }
    }, [onAddFile]);

    const storagePercentage = (storageUsed / maxStorage) * 100;

    return (
        <main className="relative z-10 w-full flex flex-col items-center min-h-screen px-4 py-24">
            <div className="w-full max-w-5xl mx-auto bg-[rgb(var(--color-bg-content-trans))] text-[rgb(var(--color-text-content))] p-8 md:p-12 rounded-xl shadow-2xl border border-[rgba(var(--color-border),0.3)] slide-down-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div className="text-center sm:text-right">
                        <NajdiLogo variant="title" />
                        <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--color-text-accent-strong))] themed-glow" style={{ letterSpacing: '0.1em' }}>
                            مساحة المشاريع
                        </h1>
                        <p className="text-[rgb(var(--color-text-content-muted))] text-lg mt-2">
                            جميع ملفاتك ومستنداتك في مكان واحد آمن.
                        </p>
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-[rgb(var(--color-bg-accent-primary))] text-[rgb(var(--color-text-on-accent))] text-lg rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] transition-all duration-300"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                         رفع ملف
                    </button>
                     <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>

                {/* Storage Meter */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2 text-sm font-semibold text-[rgb(var(--color-text-content-muted))]">
                        <span>مساحة التخزين</span>
                        <span>{formatBytes(storageUsed)} / {formatBytes(maxStorage)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4 border border-[rgba(var(--color-border),0.2)]">
                        <div 
                            className="bg-gradient-to-r from-[rgb(var(--color-text-accent))] to-[rgb(var(--color-ring))] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${storagePercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Files Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {files.length > 0 ? files.map(file => (
                        <button 
                            key={file.id}
                            onClick={() => setPreviewingFile(file)}
                            className="bg-white p-4 rounded-lg border-2 border-dashed border-[rgba(var(--color-border),0.3)] shadow-md flex flex-col items-center text-center hover:border-[rgb(var(--color-border))] hover:shadow-lg transition-all"
                        >
                            <div className="mb-3">{getFileIcon(file.type)}</div>
                            <p className="font-semibold text-gray-800 break-all w-full truncate">{file.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{formatBytes(file.size)}</p>
                        </button>
                    )) : (
                         <div className="col-span-full text-center py-16 text-slate-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-300 mb-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                            <p className="text-lg">مساحتك فارغة. ابدأ برفع أول ملف لك!</p>
                        </div>
                    )}
                </div>
            </div>

            {previewingFile && (
                <div 
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewingFile(null)}
                >
                    <div 
                        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                         <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-xl font-bold text-[rgb(var(--color-text-content))] truncate">{previewingFile.name}</h3>
                            <button onClick={() => setPreviewingFile(null)} className="p-2 rounded-full hover:bg-slate-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center min-h-[200px]">
                            <PreviewContent file={previewingFile} />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ProjectSpacePage;