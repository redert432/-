import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../App';
import * as liveService from '../services/liveService';
import NajdiLogo from './NajdiLogo';

interface LiveConversationPageProps {
  onNavigate: (page: Page) => void;
}

type SessionState = 'idle' | 'connecting' | 'active' | 'error';

const getStatusText = (state: SessionState) => {
    switch (state) {
        case 'connecting':
            return 'جاري الاتصال...';
        case 'active':
            return 'استمع الآن، تحدث للمتابعة';
        case 'error':
            return 'حدث خطأ. حاول مرة أخرى.';
        case 'idle':
        default:
            return 'انقر على المايكروفون لبدء المحادثة';
    }
}

const LiveConversationPage: React.FC<LiveConversationPageProps> = ({ onNavigate }) => {
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const sessionRef = useRef<liveService.LiveSession | null>(null);

    const startSession = async () => {
        if (sessionState !== 'idle' && sessionState !== 'error') return;
        setSessionState('connecting');
        try {
            const session = await liveService.startSession({
                onAiSpeakingChange: setIsAiSpeaking,
                onClose: () => {
                    setSessionState('idle');
                    setIsAiSpeaking(false);
                },
                onError: () => {
                     setSessionState('error');
                     setIsAiSpeaking(false);
                }
            });
            sessionRef.current = session;
            setSessionState('active');
        } catch (error) {
            console.error("Failed to start live session:", error);
            setSessionState('error');
        }
    };

    const stopSession = () => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        setSessionState('idle');
        setIsAiSpeaking(false);
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (sessionRef.current) {
                sessionRef.current.close();
            }
        };
    }, []);

    const isSessionActive = sessionState === 'active';

    return (
        <main className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4 py-24">
            <div className="w-full max-w-2xl mx-auto text-center">
                <NajdiLogo variant="title" />
                <h1 className="text-5xl font-bold themed-glow mb-4" style={{ letterSpacing: '0.1em' }}>
                    محادثة مباشرة
                </h1>
                <p className="text-[rgb(var(--color-text-muted))] text-lg mb-12 h-6">
                    {getStatusText(sessionState)}
                </p>

                <div className="relative flex items-center justify-center">
                    {isSessionActive && (
                        <>
                            <div className={`absolute w-64 h-64 bg-[rgb(var(--color-ring))] rounded-full opacity-20 animate-ping`}></div>
                            <div className={`absolute w-48 h-48 bg-[rgb(var(--color-ring))] rounded-full opacity-30 animate-ping-slow`}></div>
                        </>
                    )}

                    <button
                        onClick={isSessionActive ? stopSession : startSession}
                        className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-[rgb(var(--color-bg-main))] focus:ring-[rgb(var(--color-ring))] ${isSessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-[rgb(var(--color-bg-accent-primary))] hover:bg-[rgb(var(--color-bg-accent-primary-hover))]'}`}
                        aria-label={isSessionActive ? 'Stop conversation' : 'Start conversation'}
                    >
                        {isAiSpeaking ? (
                            <div className="speaking-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[rgb(var(--color-text-on-accent))]" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                                <path d="M5.5 4.5A2.5 2.5 0 018 2h4a2.5 2.5 0 012.5 2.5v6A2.5 2.5 0 0112 13H8a2.5 2.5 0 01-2.5-2.5v-6zM14 10a1 1 0 00-1-1H7a1 1 0 100 2h6a1 1 0 001-1z" />
                            </svg>
                        )}
                       
                    </button>
                </div>
                
                <div className="mt-20">
                    <button
                        onClick={() => {
                            stopSession();
                            onNavigate('search');
                        }}
                        className="text-[rgb(var(--color-text-link))] hover:text-[rgb(var(--color-text-link-hover))] hover:underline transition-colors duration-200"
                    >
                        → العودة إلى صفحة البحث
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes ping-slow {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.5); opacity: 0; }
                }
                .animate-ping-slow {
                    animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                .speaking-indicator span {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    margin: 0 4px;
                    background-color: rgb(var(--color-text-on-accent));
                    border-radius: 50%;
                    animation: speak 1.4s infinite ease-in-out both;
                }
                .speaking-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
                .speaking-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
                @keyframes speak {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
            `}</style>
        </main>
    );
};

export default LiveConversationPage;