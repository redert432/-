import React, { useState, useRef, useCallback } from 'react';
import { Page } from '../App';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import NajdiLogo from './NajdiLogo';

interface TtsPageProps {
  onNavigate: (page: Page) => void;
}

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

const TtsPage: React.FC<TtsPageProps> = ({ onNavigate }) => {
  const [text, setText] = useState('مرحباً بك في مولّد الأصوات من نجد الذكية. اكتب نصاً هنا لتسمعه.');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const handleGenerateAndPlay = useCallback(async () => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    if (isPlaying) {
        audioSourceRef.current?.stop();
        setIsPlaying(false);
    }

    try {
      const base64Audio = await generateSpeech(text, selectedVoice);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;
      await audioContext.resume(); // Ensure context is running

      const buffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
      audioBufferRef.current = buffer;
      
      playAudio();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      audioBufferRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, isLoading, isPlaying]);

  const playAudio = () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    
    // Stop any existing audio
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
    }

    const audioContext = audioContextRef.current;
    const source = audioContext.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContext.destination);
    source.onended = () => setIsPlaying(false);
    source.start(0);

    audioSourceRef.current = source;
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
    } else if (audioBufferRef.current) {
      playAudio();
    }
  };


  return (
    <main className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4 py-24">
      <div className="w-full max-w-2xl mx-auto bg-[rgb(var(--color-bg-content-trans))] text-[rgb(var(--color-text-content))] p-8 md:p-12 rounded-xl shadow-2xl border border-[rgba(var(--color-border),0.3)] slide-down-fade-in">
        <NajdiLogo variant="title" />
        <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-4 themed-glow text-center" style={{ letterSpacing: '0.1em' }}>
          مولّد الأصوات من نجد الذكية
        </h1>
        <p className="text-center text-[rgb(var(--color-text-content-muted))] text-lg mb-8">
          حوّل نصوصك إلى كلام مسموع بأصوات مختلفة.
        </p>

        <div className="space-y-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب شيئاً هنا..."
            rows={6}
            className="w-full p-4 text-lg bg-white/80 text-[rgb(var(--color-text-content))] border-2 border-[rgba(var(--color-border),0.5)] rounded-lg focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] focus:border-[rgb(var(--color-border))] transition-all duration-300 shadow-inner"
            disabled={isLoading}
          />

          <details className="bg-white/50 p-4 rounded-lg border border-dashed border-[rgba(var(--color-border),0.4)]">
            <summary className="text-lg font-semibold text-[rgb(var(--color-text-accent-strong))] cursor-pointer">إعدادات متقدمة</summary>
            <div className="mt-4">
              <label htmlFor="voice-select" className="block mb-2 font-medium text-[rgb(var(--color-text-content-muted))]">اختر الصوت:</label>
              <select
                id="voice-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                disabled={isLoading}
                className="w-full p-3 bg-white text-[rgb(var(--color-text-content))] border-2 border-[rgba(var(--color-border),0.5)] rounded-lg focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] focus:border-[rgb(var(--color-border))] transition-all duration-300"
              >
                {VOICES.map(voice => (
                  <option key={voice} value={voice}>{voice}</option>
                ))}
              </select>
            </div>
          </details>
          
          {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleGenerateAndPlay}
              disabled={isLoading || !text.trim()}
              className="w-full sm:flex-1 px-8 py-4 bg-[rgb(var(--color-bg-accent-primary))] text-[rgb(var(--color-text-on-accent))] text-xl rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] transition-all duration-300 transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white"></div>
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.447-.894L4 6.424v6.152l12.553-4.33a1 1 0 00.894-1.448z" /><path d="M4 12.576V14a1 1 0 001 1h10a1 1 0 001-1v-1.424l-12 4.138A1 1 0 012 16V7.424l2 1.152v3.999z" /></svg>
                  <span>إنشاء وتشغيل</span>
                </>
              )}
            </button>
            {audioBufferRef.current && !isLoading && (
              <button
                onClick={togglePlayPause}
                className="w-full sm:w-auto px-6 py-4 bg-[rgb(var(--color-bg-muted))] text-[rgb(var(--color-text-main))] rounded-full hover:bg-[rgb(var(--color-bg-muted-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] transition-all duration-300 flex items-center justify-center gap-2"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                )}
              </button>
            )}
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

export default TtsPage;