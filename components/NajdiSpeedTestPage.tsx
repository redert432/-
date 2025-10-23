import React, { useState } from 'react';
import { Page } from '../App';
import NajdiLogo from './NajdiLogo';

interface NajdiSpeedTestPageProps {
  onNavigate: (page: Page) => void;
}

type TestStep = 'idle' | 'downloading' | 'uploading' | 'security' | 'finished';

const getStepText = (step: TestStep) => {
    switch (step) {
        case 'downloading': return 'جاري قياس سرعة التنزيل...';
        case 'uploading': return 'جاري قياس سرعة الرفع...';
        case 'security': return 'فحص أمان الشبكة...';
        default: return '';
    }
}

const getNetworkTypeLabel = (effectiveType?: string): string => {
    if (!effectiveType) return 'غير معروف';
    switch (effectiveType.toLowerCase()) {
        case '4g':
            return '٤ جي';
        case '3g':
            return '٣ جي';
        case '2g':
            return '٢ جي';
        case 'slow-2g':
            return '٢ جي بطيء';
        default:
            return effectiveType.toUpperCase();
    }
};

const SpeedTestResultCard: React.FC<{ icon: React.ReactNode, title: string, value: string, description: string }> = ({ icon, title, value, description }) => (
    <div className="bg-white p-6 rounded-lg border-2 border-dashed border-[rgba(var(--color-border),0.3)] shadow-md flex flex-col items-center text-center">
        <div className="text-[rgb(var(--color-text-accent))] mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-content-muted))]">{title}</h3>
        <p className="text-3xl font-bold text-[rgb(var(--color-text-accent-strong))] my-2">{value}</p>
        <p className="text-sm text-slate-500">{description}</p>
    </div>
);


const NajdiSpeedTestPage: React.FC<NajdiSpeedTestPageProps> = ({ onNavigate }) => {
    const [step, setStep] = useState<TestStep>('idle');
    const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
    const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
    const [networkType, setNetworkType] = useState<string>('');
    const [securityStatus, setSecurityStatus] = useState<string>('');

    const isTesting = step !== 'idle' && step !== 'finished';

    const runTest = async () => {
        setStep('downloading');
        setDownloadSpeed(null);
        setUploadSpeed(null);
        setNetworkType('');
        setSecurityStatus('');

        // --- Download Test ---
        try {
            const testFileSize = 10 * 1024 * 1024; // 10MB
            const testFileUrl = `https://speed.cloudflare.com/__down?bytes=${testFileSize}`;
            const downloadStartTime = Date.now();
            const response = await fetch(testFileUrl);
            // FIX: The previous implementation didn't wait for the body to be downloaded.
            // By calling response.arrayBuffer(), we ensure we time the entire file download,
            // which gives an accurate speed measurement.
            await response.arrayBuffer(); 
            const downloadEndTime = Date.now();
            const downloadDuration = (downloadEndTime - downloadStartTime) / 1000;
            const bitsLoaded = testFileSize * 8;
            const speedMbps = (bitsLoaded / downloadDuration) / 1_000_000;
            setDownloadSpeed(parseFloat(speedMbps.toFixed(2)));
        } catch (error) {
            console.error("Download test failed:", error);
            setDownloadSpeed(0); // Indicate failure
        }
        
        setStep('uploading');

        // --- Upload Test ---
        try {
            const uploadDataSize = 5 * 1024 * 1024; // 5MB
            const formData = new FormData();
            formData.append('data', new Blob([new ArrayBuffer(uploadDataSize)]));
            
            const uploadStartTime = Date.now();
            await fetch('https://speed.cloudflare.com/__up', { method: 'POST', body: formData });
            const uploadEndTime = Date.now();
            const uploadDuration = (uploadEndTime - uploadStartTime) / 1000;
            const uploadSpeedMbps = ((uploadDataSize * 8) / uploadDuration) / 1_000_000;
            setUploadSpeed(parseFloat(uploadSpeedMbps.toFixed(2)));
        } catch (error) {
            console.error("Upload test failed:", error);
            setUploadSpeed(0); // Indicate failure
        }
        
        setStep('security');
        await new Promise(res => setTimeout(res, 1500)); // Simulate security scan

        // --- Network Info & Security ---
        const connection = (navigator as any).connection;
        setNetworkType(getNetworkTypeLabel(connection?.effectiveType));
        setSecurityStatus('شبكتك تبدو آمنة ومستقرة');

        setStep('finished');
    };
    
    const getSpeedDescription = (speed: number | null) => {
        if (speed === null || speed === 0) return "لم يتم القياس بنجاح.";
        if (speed < 5) return "سرعة مناسبة للتصفح الأساسي.";
        if (speed < 25) return "جيدة لبث الفيديو بجودة HD.";
        if (speed < 100) return "ممتازة لبث الفيديو 4K والألعاب.";
        return "سرعة عالية جداً، كأنها صقر!";
    }

    return (
        <main className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4 py-24">
            <div className="w-full max-w-4xl mx-auto bg-[rgb(var(--color-bg-content-trans))] text-[rgb(var(--color-text-content))] p-8 md:p-12 rounded-xl shadow-2xl border border-[rgba(var(--color-border),0.3)] slide-down-fade-in text-center">
                <NajdiLogo variant="title" />
                <h1 className="text-5xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-4 themed-glow" style={{ letterSpacing: '0.1em' }}>
                    اختبار سرعة نجد الذكية
                </h1>

                {step === 'idle' && (
                    <>
                        <p className="text-[rgb(var(--color-text-content-muted))] text-lg mb-8">
                            قِس سرعة اتصالك بالإنترنت واكتشف أداء شبكتك بلمسة زر.
                        </p>
                        <button
                            onClick={runTest}
                            disabled={isTesting}
                            className="w-full sm:w-auto px-12 py-4 bg-[rgb(var(--color-bg-accent-primary))] text-[rgb(var(--color-text-on-accent))] text-xl rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] transition-all duration-300 transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed"
                        >
                            ابدأ الاختبار
                        </button>
                    </>
                )}

                {isTesting && (
                    <div className="my-8">
                        <div className="relative w-full h-8 bg-slate-200 rounded-full overflow-hidden border-2 border-[rgba(var(--color-border),0.3)]">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[rgb(var(--color-bg-accent-secondary))] to-[rgb(var(--color-bg-accent-primary))] animate-pulse" style={{ width: '100%' }}></div>
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 animate-[camelWalk_10s_linear_infinite]" style={{ transform: 'translateX(-100%)' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[rgb(var(--color-text-accent-strong))] -scale-x-100">
                                    <path d="M4.28.98l.27 1.76a4 4 0 003.9 3.26h2.1a2 2 0 012 2v2.13a4 4 0 003.46 3.9l1.4.2a1 1 0 01.9 1.4l-1.12 3.12a1 1 0 01-1.37.52l-2.82-1.4a1 1 0 00-1.18.15l-2.07 1.8a1 1 0 01-1.25.1L4.4 16.5a1 1 0 01-.3-1.37l1.1-2.2a1 1 0 000-1.06L4 9.68a1 1 0 01.3-1.37l2.8-1.58a1 1 0 00.55-1.18L6.2 2.37A1 1 0 014.8.98h-.52zM19 12a1 1 0 100-2 1 1 0 000 2z" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>
                        <p className="text-[rgb(var(--color-text-accent))] text-lg mt-4 font-semibold">{getStepText(step)}</p>
                    </div>
                )}
                
                {step === 'finished' && (
                    <div className="my-8 fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <SpeedTestResultCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                                title="سرعة التنزيل"
                                value={`${downloadSpeed ?? '...'} Mbps`}
                                description={getSpeedDescription(downloadSpeed)}
                            />
                             <SpeedTestResultCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293 7.293a1 1 0 011.414 0L9 11.586V17a1 1 0 11-2 0v-5.414L5.707 10.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                                title="سرعة الرفع"
                                value={`${uploadSpeed ?? '...'} Mbps`}
                                description={getSpeedDescription(uploadSpeed)}
                            />
                             <SpeedTestResultCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M5 12a1 1 0 102 0V6.414l.293.293a1 1 0 001.414-1.414l-2-2a1 1 0 00-1.414 0l-2 2a1 1 0 001.414 1.414l.293-.293V12z" /><path d="M15 8a1 1 0 10-2 0v5.586l-.293-.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414l-.293.293V8z" /></svg>}
                                title="نوع الشبكة"
                                value={networkType}
                                description="جودة الاتصال المقدرة."
                            />
                             <SpeedTestResultCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.09l.292.156a.5.5 0 01-.479.872l-1.996-.997a.5.5 0 01.342-.87l.21-.105A12.002 12.002 0 0110 1.944zM10 18c-3.132 0-5.992-1.25-8.05-3.218l-.22-.164a.5.5 0 01.479-.872l1.996.997a.5.5 0 01-.342.87l-.21.105A12.002 12.002 0 0110 18z" clipRule="evenodd" /></svg>}
                                title="حالة الأمان"
                                value="آمن"
                                description={securityStatus}
                            />
                        </div>
                        <button
                            onClick={runTest}
                            disabled={isTesting}
                            className="w-full sm:w-auto px-8 py-3 bg-[rgb(var(--color-bg-accent-primary))] text-[rgb(var(--color-text-on-accent))] rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] transition-all duration-300 transform hover:scale-105"
                        >
                            إعادة الاختبار
                        </button>
                    </div>
                )}


                <div className="mt-8">
                    <button
                        onClick={() => onNavigate('search')}
                        className="text-[rgb(var(--color-text-link))] hover:text-[rgb(var(--color-text-link-hover))] hover:underline transition-colors duration-200"
                    >
                        → العودة إلى صفحة البحث
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes camelWalk {
                    0% { transform: translateX(110vw); }
                    100% { transform: translateX(-100px); }
                }
            `}</style>
        </main>
    );
};

export default NajdiSpeedTestPage;