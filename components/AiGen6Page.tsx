import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Page } from '../App';
import DarkWaves from './DarkWaves';
import PulsingStars from './PulsingStars';
import useParallax from '../hooks/useParallax';
import ChatMessage from './ChatMessage';
import { Source, AiChatMessage } from '../types';
import { GoogleGenAI, GenerateContentResponse, Part, Content } from '@google/genai';
import { getWeatherFunctionDeclaration } from '../services/geminiTools';

interface AiGen6PageProps {
  onNavigate: (page: Page) => void;
}

type AiGen6Task = 'chat' | 'novelist';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const AiGen6Page: React.FC<AiGen6PageProps> = ({ onNavigate }) => {
    const [activeTask, setActiveTask] = useState<AiGen6Task>('chat');
    const [messages, setMessages] = useState<AiChatMessage[]>([
        { id: 'initial', sender: 'ai', text: 'أهلاً بك في AI Gen 6. كيف يمكنني مساعدتك اليوم؟ جرّب أن تسأل عن الطقس!', isThinking: false }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const parallaxOffset = useParallax(20);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const chatHistoryRef = useRef<Content[]>([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleTaskSwitch = (task: AiGen6Task) => {
        if (task === activeTask) return;
        
        setActiveTask(task);
        // Reset the conversation
        chatHistoryRef.current = [];
        setMessages([
            { id: 'initial', sender: 'ai', text: task === 'novelist' ? 'أهلاً بك في ورشة الروائي. ما هي القصة التي تود أن نكتبها اليوم؟' : 'أهلاً بك في AI Gen 6. كيف يمكنني مساعدتك اليوم؟', isThinking: false }
        ]);
        setInput('');
    };

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentInput = input;
        const userMessage: AiChatMessage = { id: Date.now().toString(), sender: 'user', text: currentInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setMessages(prev => [...prev, { id: 'thinking', sender: 'ai', text: '', isThinking: true }]);

        const userContent: Content = { role: 'user', parts: [{ text: currentInput }] };

        try {
            if (activeTask === 'novelist') {
                const model = 'gemini-2.5-pro';
                const config = {
                    systemInstruction: 'أنت روائي وخبير في سرد القصص. مهمتك هي كتابة قصص وروايات آسرة وذكية وعاطفية بناءً على طلب المستخدم. ركز على إنشاء شخصيات عميقة، وحبكات معقدة، وأوصاف غنية، وحوار طبيعي. عندما يطلب منك المستخدم المتابعة، ابنِ على السرد الحالي بطريقة إبداعية ومتماسكة.',
                    thinkingConfig: { thinkingBudget: 32768 }
                };
                const contents = [...chatHistoryRef.current, userContent];
                
                const response = await ai.models.generateContent({ model, contents, config });
                const text = response.text;
                const aiMessage: AiChatMessage = { id: Date.now().toString(), sender: 'ai', text };
                chatHistoryRef.current.push(userContent, { role: 'model', parts: [{ text }] });
                setMessages(prev => [...prev.filter(m => m.id !== 'thinking'), aiMessage]);
            } else { // 'chat' task
                const result = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: [...chatHistoryRef.current, userContent],
                    config: {
                        tools: [{ functionDeclarations: [getWeatherFunctionDeclaration] }]
                    }
                });

                const response = result;
                const functionCalls = response.functionCalls;

                if (functionCalls && functionCalls.length > 0) {
                    const fc = functionCalls[0];
                    if (fc.name === 'get_weather_forecast') {
                        // FIX: The type of `fc.args.location` is inferred as `unknown`.
                        // Explicitly convert it to a string using `String()` to ensure type compatibility
                        // with the `weather.location` property in the `Message` interface.
                        const location = String(fc.args.location || 'الرياض');
                        // Mock weather data
                        const weatherData = {
                            location: location,
                            temperature: `${Math.floor(Math.random() * 15) + 25}°C`,
                            forecast: 'مشمس بشكل عام مع احتمال ظهور بعض السحب المتفرقة.',
                            icon: '☀️',
                        };
                        
                        const functionResponsePart: Part = {
                            functionResponse: {
                                name: 'get_weather_forecast',
                                response: { content: weatherData },
                            }
                        };

                        const modelContent: Content = { role: 'model', parts: [{ functionCall: fc }] };
                        const functionResponseContent: Content = { role: 'user', parts: [functionResponsePart] };

                        const result2 = await ai.models.generateContent({
                            model: 'gemini-2.5-pro',
                            contents: [...chatHistoryRef.current, userContent, modelContent, functionResponseContent],
                            config: {
                                tools: [{ functionDeclarations: [getWeatherFunctionDeclaration] }]
                            }
                        });
                        
                        const finalResponse = result2;
                        const aiMessage: AiChatMessage = {
                            id: Date.now().toString() + '-weather',
                            sender: 'ai',
                            text: finalResponse.text,
                            weather: weatherData,
                        };
                        
                        chatHistoryRef.current.push(userContent, modelContent, functionResponseContent, { role: 'model', parts: [{ text: finalResponse.text }] });
                        setMessages(prev => [...prev.filter(m => m.id !== 'thinking'), aiMessage]);
                    }
                } else {
                    const text = response.text;
                    const aiMessage: AiChatMessage = { id: Date.now().toString(), sender: 'ai', text: text };
                    chatHistoryRef.current.push(userContent, { role: 'model', parts: [{ text: text }] });
                    setMessages(prev => [...prev.filter(m => m.id !== 'thinking'), aiMessage]);
                }
            }
        } catch (err) {
            console.error(err);
            const errorMessage: AiChatMessage = {
                id: 'error',
                sender: 'ai',
                text: 'عفواً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
            };
            setMessages(prev => [...prev.filter(m => m.id !== 'thinking'), errorMessage]);
        } finally {
            setIsLoading(false);
        }

    }, [input, isLoading, activeTask]);

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#0a0f1e] text-white">
            <div className="absolute top-[-5%] left-[-5%] w-[110%] h-[110%] z-0 transition-transform duration-300 ease-out" style={{ transform: `translateX(${parallaxOffset.x}px) translateY(${parallaxOffset.y}px)` }}>
                <DarkWaves />
                <PulsingStars />
            </div>
            <main className="relative z-10 w-full flex-1 flex flex-col h-full">
                <div className="p-2 border-b border-slate-700/50 text-center bg-black/10 backdrop-blur-sm">
                  <div className="inline-flex rounded-full bg-slate-800 p-1">
                    <button 
                        onClick={() => handleTaskSwitch('chat')} 
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeTask === 'chat' ? 'animated-cyan-gradient text-white font-bold' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
                        المحادثة العامة
                      </span>
                    </button>
                    <button 
                        onClick={() => handleTaskSwitch('novelist')} 
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeTask === 'novelist' ? 'animated-cyan-gradient text-white font-bold' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                      <span className="flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" /></svg>
                         روائي الذكاء الاصطناعي
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-slate-700">
                    <form onSubmit={handleSendMessage} className="w-full max-w-4xl mx-auto">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={activeTask === 'novelist' ? 'اكتب فكرة قصة، أو شخصية، أو اطلب مني المتابعة...' : 'اكتب رسالتك هنا...'}
                                disabled={isLoading}
                                className="w-full py-3 pr-4 pl-12 text-lg bg-slate-800 text-white border-2 border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-slate-900 rounded-full hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
                                aria-label="Send message"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 0010 16h.002a1 1 0 00.725-.308l5-1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </div>
                    </form>
                    <button onClick={() => onNavigate('search')} className="text-cyan-400 hover:underline transition-colors text-xs mx-auto block mt-2">
                        → العودة إلى البحث
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AiGen6Page;