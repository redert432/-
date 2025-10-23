import React, { useState, useRef, useEffect } from 'react';
import { UserAccount, Contact, ChatMessage, ProjectFile } from '../types';
import NajdiLogo from './NajdiLogo';
import { Page } from '../App';


interface NajdiConnectPageProps {
  userAccount: UserAccount | null;
  onLogin: (account: UserAccount, password?: string) => void;
  projectFiles: ProjectFile[];
  onNavigate: (page: Page, options?: any) => void;
}

const NajdiConnectPage: React.FC<NajdiConnectPageProps> = ({ userAccount, onLogin, projectFiles, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Chat state
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [key: string]: ChatMessage[] }>({});
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');


  // Meeting state
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  
  const contacts = userAccount?.contacts || [];

  const getChatKey = (email1: string, email2: string) => {
    return [email1, email2].sort().join('__najdi__');
  };

  useEffect(() => {
    // Load all users for contact search
    const allUsersRaw = localStorage.getItem('najdiAllUsers');
    setAllUsers(allUsersRaw ? JSON.parse(allUsersRaw) : []);

    // Load all messages
    const allMessagesRaw = localStorage.getItem('najdiAllMessages');
    setMessages(allMessagesRaw ? JSON.parse(allMessagesRaw) : {});
    
    if (userAccount && !activeChat) {
      // Default to self-chat if no other chat is active
      setActiveChat(userAccount.email);
    }
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'najdiAllMessages' && event.newValue) {
            setMessages(JSON.parse(event.newValue));
        }
        if (event.key === 'najdiUserAccount' && event.newValue) {
            const updatedAccount = JSON.parse(event.newValue);
            if (updatedAccount.email === userAccount?.email) {
                onLogin(updatedAccount); 
            }
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [userAccount, activeChat, onLogin]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin({ email, profileImage, contacts: [] }, password);
    }
  };

  const handleConfirmAddContact = () => {
    if (newContactEmail && userAccount && newContactEmail !== userAccount.email) {
        if (allUsers.some(u => u.email === newContactEmail)) {
            if (!(userAccount.contacts || []).some(c => c.email === newContactEmail)) {
                const updatedAccount = {
                    ...userAccount,
                    contacts: [...(userAccount.contacts || []), { email: newContactEmail }]
                };
                localStorage.setItem('najdiUserAccount', JSON.stringify(updatedAccount));
                onLogin(updatedAccount);
                setActiveChat(newContactEmail);
                setIsAddContactModalOpen(false);
                setNewContactEmail('');
            } else {
                alert('جهة الاتصال موجودة بالفعل.');
            }
        } else {
            alert('المستخدم غير موجود. تأكد من أن البريد الإلكتروني صحيح ومسجل في نجد الذكية.');
        }
    } else {
        alert('البريد الإلكتروني غير صالح.');
    }
  };
  
  const handleSendMessage = (file?: ProjectFile) => {
      if (!activeChat || !userAccount) return;
      if (!newMessage.trim() && !file) return;

      const message: ChatMessage = file ? {
          id: Date.now().toString(),
          sender: 'me',
          type: 'file',
          content: file.name,
          file: file,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit'})
      } : {
          id: Date.now().toString(),
          sender: 'me',
          type: 'text',
          content: newMessage,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit'})
      };

      const chatKey = getChatKey(userAccount.email, activeChat);
      const allMessagesRaw = localStorage.getItem('najdiAllMessages');
      const allMessages = allMessagesRaw ? JSON.parse(allMessagesRaw) : {};
      
      if (!allMessages[chatKey]) {
          allMessages[chatKey] = [];
      }
      allMessages[chatKey].push(message);

      localStorage.setItem('najdiAllMessages', JSON.stringify(allMessages));
      setMessages(allMessages);
      setNewMessage('');
      setIsAttachmentModalOpen(false);
  };
  
    const createMeeting = (instant: boolean) => {
        const meetingId = crypto.randomUUID();
        if (instant) {
            onNavigate('meeting', { meetingId, isHost: true });
        } else {
            const meetingLink = `${window.location.origin}${window.location.pathname}#meeting/${meetingId}`;
            prompt("رابط الاجتماع جاهز للمشاركة:", meetingLink);
        }
        setIsMeetingModalOpen(false);
    };

    const joinMeeting = () => {
        if (joinCode.trim()) {
            const meetingId = joinCode.includes('/') ? joinCode.split('/').pop() : joinCode;
            onNavigate('meeting', { meetingId, isHost: false });
        }
        setIsJoinModalOpen(false);
    };

  if (!userAccount) {
    // --- Login/Signup Form ---
    return (
      <main className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4 py-24">
        <div className="w-full max-w-md mx-auto bg-[rgb(var(--color-bg-content-trans))] text-[rgb(var(--color-text-content))] p-8 md:p-10 rounded-xl shadow-2xl border border-[rgba(var(--color-border),0.3)] slide-down-fade-in text-center">
          <NajdiLogo variant="title" />
          <h1 className="text-5xl font-bold text-[rgb(var(--color-text-accent-strong))] mb-4 themed-glow" style={{ letterSpacing: '0.1em' }}>
            نجد Connect
          </h1>
          <p className="text-[rgb(var(--color-text-content-muted))] text-lg mb-8">
            أنشئ حسابك للتواصل ومشاركة الملفات في عالم نجد الذكية.
          </p>

          <form onSubmit={handleCreateAccount} className="space-y-6">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img 
                src={profileImage || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%23a0aec0"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>`} 
                alt="Profile Preview" 
                className="w-full h-full rounded-full object-cover border-4 border-dashed border-[rgba(var(--color-border),0.4)]"
              />
              <button 
                type="button"
                onClick={triggerFileSelect}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[rgb(var(--color-bg-accent-primary))] text-white rounded-full flex items-center justify-center hover:bg-[rgb(var(--color-bg-accent-primary-hover))] transition-colors border-2 border-[rgb(var(--color-bg-content))]"
                aria-label="Change profile picture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
            
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 text-lg text-center bg-white/80 text-[rgb(var(--color-text-content))] border-2 border-[rgba(var(--color-border),0.5)] rounded-full focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] focus:border-[rgb(var(--color-border))] transition-all duration-300 shadow-inner"
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 text-lg text-center bg-white/80 text-[rgb(var(--color-text-content))] border-2 border-[rgba(var(--color-border),0.5)] rounded-full focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] focus:border-[rgb(var(--color-border))] transition-all duration-300 shadow-inner"
            />
            <button
              type="submit"
              className="w-full px-8 py-3 bg-[rgb(var(--color-bg-accent-primary))] text-[rgb(var(--color-text-on-accent))] rounded-full hover:bg-[rgb(var(--color-bg-accent-primary-hover))] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-ring),0.5)] transition-all duration-300 transform hover:scale-105 font-bold"
            >
              دخول / إنشاء حساب
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- Chat Interface ---
  return (
    <main className="relative z-10 w-full flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl h-[90vh] mx-auto bg-[rgb(var(--color-bg-content-trans))] rounded-xl shadow-2xl border border-[rgba(var(--color-border),0.3)] slide-down-fade-in flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 bg-white/50 border-l border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                     <img src={userAccount.profileImage || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%23a0aec0"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>`} alt="My Profile" className="w-10 h-10 rounded-full object-cover" />
                     <span className="font-semibold text-[rgb(var(--color-text-content))] truncate">{userAccount.email}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Self-chat button */}
                    <button onClick={() => setActiveChat(userAccount.email)} className={`w-full text-right p-4 flex items-center gap-3 transition-colors ${activeChat === userAccount.email ? 'bg-[rgba(var(--color-border),0.1)]' : 'hover:bg-slate-100'}`}>
                        <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm2 0v12h6V4H7z" /><path d="M12 4h2a2 2 0 012 2v8a2 2 0 01-2 2h-2V4z" /></svg>
                        </div>
                        <div>
                            <span className="font-medium text-slate-700">الرسائل المحفوظة</span>
                            <p className="text-xs text-slate-500">مراسلة نفسك</p>
                        </div>
                    </button>
                    {contacts.map(contact => (
                        <button key={contact.email} onClick={() => setActiveChat(contact.email)} className={`w-full text-right p-4 flex items-center gap-3 transition-colors ${activeChat === contact.email ? 'bg-[rgba(var(--color-border),0.1)]' : 'hover:bg-slate-100'}`}>
                            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                            <span className="font-medium text-slate-700">{contact.email}</span>
                        </button>
                    ))}
                </div>
                <div className="p-2 border-t border-slate-200">
                    <button onClick={() => setIsAddContactModalOpen(true)} className="w-full flex items-center justify-center gap-2 p-3 text-sm text-[rgb(var(--color-text-link))] hover:bg-blue-50 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                        إضافة جهة اتصال
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-slate-50">
                {activeChat ? (
                    <>
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/80">
                            <h2 className="font-bold text-lg text-[rgb(var(--color-text-content))]">{activeChat === userAccount.email ? 'الرسائل المحفوظة' : activeChat}</h2>
                             <div className="flex items-center gap-2">
                                <button onClick={() => setIsMeetingModalOpen(true)} className="px-4 py-2 text-sm bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                    اجتماع جديد
                                </button>
                                <button onClick={() => setIsJoinModalOpen(true)} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                                    انضمام
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {(messages[getChatKey(userAccount.email, activeChat)] || []).map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'me' ? 'bg-[rgb(var(--color-bg-accent-primary))] text-white' : 'bg-white border'}`}>
                                        {msg.type === 'file' ? (
                                            <div className="flex items-center gap-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                                                <span className="font-semibold">{msg.content}</span>
                                            </div>
                                        ) : msg.content}
                                        <div className={`text-xs mt-1 text-right ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-white">
                            <div className="relative flex items-center">
                                <button onClick={() => setIsAttachmentModalOpen(true)} className="p-2 text-slate-500 hover:text-slate-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg></button>
                                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="اكتب رسالتك..." className="w-full p-3 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-border))]" />
                                <button onClick={() => handleSendMessage()} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[rgb(var(--color-bg-accent-primary))] text-white rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 0010 16h.002a1 1 0 00.725-.308l5-1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">اختر محادثة للبدء</div>
                )}
            </div>
        </div>

        {isAddContactModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center" onClick={() => setIsAddContactModalOpen(false)}>
                <div className="bg-white text-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-center">إضافة جهة اتصال جديدة</h3>
                    <p className="text-sm text-center text-slate-500">أدخل البريد الإلكتروني للمستخدم المسجل في نجد الذكية.</p>
                    <input 
                        value={newContactEmail} 
                        onChange={e => setNewContactEmail(e.target.value)} 
                        placeholder="example@email.com" 
                        className="w-full p-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setIsAddContactModalOpen(false)} className="flex-1 p-2 mt-2 text-slate-500 hover:bg-slate-100 rounded-lg">إلغاء</button>
                        <button onClick={handleConfirmAddContact} className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold">إضافة</button>
                    </div>
                </div>
            </div>
        )}

        {isMeetingModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center" onClick={() => setIsMeetingModalOpen(false)}>
                <div className="bg-white text-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-center">إنشاء اجتماع</h3>
                    <button onClick={() => createMeeting(false)} className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-lg font-semibold">تلقي رابط اجتماع للمشاركة</button>
                    <button onClick={() => createMeeting(true)} className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 text-lg font-semibold">بدء اجتماع فوري</button>
                    <button onClick={() => setIsMeetingModalOpen(false)} className="w-full p-2 mt-2 text-slate-500 hover:bg-slate-100 rounded-lg">إلغاء</button>
                </div>
            </div>
        )}

        {isJoinModalOpen && (
             <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center" onClick={() => setIsJoinModalOpen(false)}>
                <div className="bg-white text-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-center">الانضمام إلى اجتماع</h3>
                    <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="أدخل الرمز أو الرابط" className="w-full p-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={joinMeeting} className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold">انضمام</button>
                </div>
            </div>
        )}

        {isAttachmentModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center" onClick={() => setIsAttachmentModalOpen(false)}>
                <div className="bg-white text-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">مشاركة ملف من مساحة المشاريع</h3>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {projectFiles.length > 0 ? projectFiles.map(file => (
                            <button key={file.id} onClick={() => handleSendMessage(file)} className="w-full text-right p-3 hover:bg-slate-100 rounded-lg flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                                <div>
                                    <p className="font-semibold">{file.name}</p>
                                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </button>
                        )) : <p className="text-center text-slate-500 py-4">لا توجد ملفات في مساحة المشاريع.</p>}
                    </div>
                </div>
            </div>
        )}
    </main>
  );
};

export default NajdiConnectPage;