import React from 'react';
import { Source } from '../types';

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    imageUrl?: string;
    videoUrl?: string;
    sources?: Source[];
    weather?: { location: string; temperature: string; forecast: string; icon: string; };
    isThinking?: boolean;
    loadingMessage?: string;
}

interface ChatMessageProps {
  message: ChatMessage;
}

const formatResultText = (text: string) => {
    const checkboxText = text.replace(/\[ \]/g, '☐').replace(/\[x\]/g, '☑');
    let html = checkboxText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/### (.*)/g, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-6 mb-3 border-b-2 border-slate-300 pb-2">$1</h2>')
      .replace(/\n/g, '<br />');
    return { __html: html };
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.sender === 'user';

    if (message.isThinking || message.loadingMessage) {
        return (
             <div className="flex justify-start">
                <div className="bg-[rgba(var(--color-bg-muted),0.5)] text-[rgb(var(--color-text-main))] max-w-lg p-3 rounded-lg flex items-center gap-3">
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    {message.loadingMessage && <span className="text-slate-300 text-sm">{message.loadingMessage}</span>}
                    <style>{`
                        .typing-indicator span {
                            display: inline-block;
                            width: 8px;
                            height: 8px;
                            margin: 0 2px;
                            background-color: rgb(var(--color-text-muted));
                            border-radius: 50%;
                            animation: typing 1.4s infinite ease-in-out both;
                        }
                        .typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
                        .typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
                        @keyframes typing {
                            0%, 80%, 100% { transform: scale(0); }
                            40% { transform: scale(1.0); }
                        }
                    `}</style>
                </div>
            </div>
        )
    }

    return (
        <div className={`flex w-full items-start gap-3 fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
             {!isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
            )}
            <div className={`max-w-lg space-y-3 ${isUser ? 'text-right' : 'text-right'}`}>
                <div className={`p-4 rounded-xl shadow-md ${isUser ? 'bg-blue-600 text-white' : 'bg-[rgba(var(--color-bg-muted),0.5)] text-[rgb(var(--color-text-main))]'}`}>
                    {message.imageUrl && <img src={message.imageUrl} alt="Chat content" className="rounded-lg mb-2 max-w-sm"/>}
                    {message.videoUrl && (
                        <video controls src={message.videoUrl} className="rounded-lg mb-2 max-w-sm w-full">
                            Your browser does not support the video tag.
                        </video>
                    )}
                    {message.text && <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={formatResultText(message.text)} />}

                    {message.weather && (
                        <div className="mt-2 p-4 bg-black/20 rounded-lg border border-white/20">
                            <p className="text-lg font-bold">{message.weather.location}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-3xl">{message.weather.icon}</span>
                                <span className="text-2xl font-bold">{message.weather.temperature}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-300">{message.weather.forecast}</p>
                        </div>
                    )}
                </div>
            </div>
             {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                </div>
            )}
        </div>
    );
};

export default ChatMessage;