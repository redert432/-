import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { encode, decode, decodeAudioData, createBlob } from "../utils/audio";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface LiveSessionCallbacks {
    onAiSpeakingChange: (isSpeaking: boolean) => void;
    onClose: () => void;
    onError: (error: ErrorEvent) => void;
}

export interface LiveSession {
    close: () => void;
}

export const startSession = async (callbacks: LiveSessionCallbacks): Promise<LiveSession> => {
    // --- Audio Context Setup ---
    let nextStartTime = 0;
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const sources = new Set<AudioBufferSourceNode>();

    // --- Media Stream Setup ---
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // --- Session Promise ---
    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                // Stream audio from the microphone to the model.
                const source = inputAudioContext.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, **do not** add other condition checks.
                    sessionPromise.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };

                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                
                if (base64EncodedAudioString) {
                    callbacks.onAiSpeakingChange(true);

                    nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    
                    const audioBuffer = await decodeAudioData(
                        decode(base64EncodedAudioString),
                        outputAudioContext,
                        24000,
                        1,
                    );

                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContext.destination);
                    
                    source.addEventListener('ended', () => {
                        sources.delete(source);
                        if (sources.size === 0) {
                            callbacks.onAiSpeakingChange(false);
                        }
                    });

                    source.start(nextStartTime);
                    nextStartTime = nextStartTime + audioBuffer.duration;
                    sources.add(source);
                }

                const interrupted = message.serverContent?.interrupted;
                if (interrupted) {
                    for (const source of sources.values()) {
                        source.stop();
                        sources.delete(source);
                    }
                    nextStartTime = 0;
                    callbacks.onAiSpeakingChange(false);
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error('Live session error:', e);
                callbacks.onError(e);
            },
            onclose: (e: CloseEvent) => {
                callbacks.onClose();
            },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are a friendly and helpful assistant from Najd Smart. Keep your responses concise and conversational.',
        },
    });
    
    // --- Cleanup Logic ---
    const close = async () => {
        const session = await sessionPromise;
        session.close();
        
        stream.getTracks().forEach(track => track.stop());
        
        if (inputAudioContext.state !== 'closed') {
            await inputAudioContext.close();
        }
        if (outputAudioContext.state !== 'closed') {
            await outputAudioContext.close();
        }
    };

    return { close };
};