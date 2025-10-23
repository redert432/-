import React, { useEffect, useRef, useState } from 'react';

interface MeetingPageProps {
  meetingId: string;
  isHost: boolean;
  onLeave: () => void;
}

const MeetingPage: React.FC<MeetingPageProps> = ({ meetingId, isHost, onLeave }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing media devices.", err);
                alert("لا يمكن الوصول إلى الكاميرا أو الميكروفون. يرجى التحقق من الأذونات.");
            }
        };
        startCamera();

        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const toggleMute = () => {
        streamRef.current?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMuted(prev => !prev);
    };

    const toggleCamera = () => {
        streamRef.current?.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsCameraOff(prev => !prev);
    };

    const handleLeave = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        onLeave();
    };

    const meetingLink = `${window.location.origin}${window.location.pathname}#meeting/${meetingId}`;

    return (
        <main className="relative z-10 w-full h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4 text-sm bg-black/50 p-2 rounded-lg">
                <p className="font-bold">معلومات الاجتماع</p>
                <button 
                    onClick={() => navigator.clipboard.writeText(meetingLink)} 
                    className="text-cyan-400 hover:underline"
                >
                    نسخ رابط الانضمام
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full flex-1 max-w-7xl mb-24">
                <div className="relative bg-black rounded-lg overflow-hidden w-full h-full border-2 border-gray-700">
                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraOff ? 'opacity-0' : 'opacity-100'}`}></video>
                    {isCameraOff && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 p-2 rounded text-sm">أنت</div>
                </div>

                <div className="relative bg-black rounded-lg overflow-hidden w-full h-full border-2 border-gray-700 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                        <svg className="w-24 h-24 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>
                        <p className="mt-2">في انتظار انضمام الآخرين...</p>
                    </div>
                     <div className="absolute bottom-2 left-2 bg-black/50 p-2 rounded text-sm">مشارك آخر</div>
                </div>
            </div>

            <div className="absolute bottom-8 flex items-center gap-4 bg-gray-800/80 backdrop-blur-sm p-4 rounded-full border border-gray-600">
                <button onClick={toggleMute} title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}>
                   {isMuted ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                </button>
                <button onClick={toggleCamera} title={isCameraOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isCameraOff ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}>
                   {isCameraOff ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>}
                </button>
                <button onClick={handleLeave} title="إنهاء المكالمة" className="w-20 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M17.926 4.975a1 1 0 00-1.344-.133l-2.006 1.672a1 1 0 01-1.21-.057l-1.12-1.12a1 1 0 00-1.414 0l-1.12 1.12a1 1 0 01-1.21.057l-2.006-1.672a1 1 0 00-1.344.133 10.03 10.03 0 00-1.414 1.414 1 1 0 00.133 1.344l1.672 2.006a1 1 0 01.057 1.21l-1.12 1.12a1 1 0 000 1.414l1.12 1.12a1 1 0 01-.057 1.21l-1.672 2.006a1 1 0 00.133 1.344 10.03 10.03 0 001.414 1.414 1 1 0 001.344-.133l2.006-1.672a1 1 0 011.21.057l1.12 1.12a1 1 0 001.414 0l1.12-1.12a1 1 0 011.21-.057l2.006 1.672a1 1 0 001.344.133 10.03 10.03 0 001.414-1.414 1 1 0 00-.133-1.344l-1.672-2.006a1 1 0 01-.057-1.21l1.12-1.12a1 1 0 000-1.414l-1.12-1.12a1 1 0 01.057-1.21l1.672-2.006a1 1 0 00-.133-1.344 10.03 10.03 0 00-1.414-1.414z" /></svg>
                </button>
            </div>
        </main>
    );
};

export default MeetingPage;