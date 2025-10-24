import React, { useState, useCallback, useEffect } from 'react';
import SearchPage from './components/SearchPage';
import NajdiConnectPage from './components/NajdiConnectPage';
import Header from './components/Header';
import DigitalDesert from './components/DigitalDesert';
import NajdiSpeedTestPage from './components/NajdiSpeedTestPage';
import LiveConversationPage from './components/LiveConversationPage';
import TtsPage from './components/TtsPage';
import HomePage from './components/HomePage';
import BusinessPage from './components/BusinessPage';
import AiGen6Page from './components/AiGen6Page';
import AiGen6CreativePage from './components/AiGen6CreativePage';
import ProjectSpacePage from './components/ProjectSpacePage';
import CorporateResearchPage from './components/CorporateResearchPage';
import SpreadsheetPage from './components/SpreadsheetPage';
import WordProcessorPage from './components/WordProcessorPage';
import PresentationBuilderPage from './components/PresentationBuilderPage';
import WebAppBuilderPage from './components/WebAppBuilderPage';
import BuildLogsPage from './components/BuildLogsPage';
import { UserAccount, ProjectFile, Log, LogLevel, ConnectChatMessage } from './types';
import MeetingPage from './components/MeetingPage';

export type Page = 'home' | 'search' | 'email' | 'speedtest' | 'live' | 'tts' | 'business' | 'aigen6' | 'aigen6-creative' | 'projectspace' | 'cr' | 'spreadsheet' | 'word-processor' | 'presentation-builder' | 'meeting' | 'webapp-builder' | 'build-logs';
export type Theme = 'default' | 'classic' | 'modern' | 'dark' | 'interactive-dark' | 'blue-purple-interactive';

const DEFAULT_STORAGE = 50 * 1024 * 1024 * 1024; // 50 GB
const PREMIUM_STORAGE = 1024 * 1024 * 1024 * 1024; // 1 TB

const getLogTemplate = (projectName: string): Omit<Log, 'timestamp'>[] => [
    { level: 'info', message: `Build triggered for project: ${projectName}` },
    { level: 'info', message: 'Configuration: 2 Cores, 8GB RAM' },
    { level: 'info', message: `Cloning repository from najd-cloud/users/me/${projectName}` },
    { level: 'info', message: 'Previous build cache not available.' },
    { level: 'info', message: 'Cloning complete: 518ms' },
    { level: 'info', message: 'Running "vercel build"' },
    { level: 'info', message: 'Vercel CLI 34.1.0' },
    { level: 'info', message: 'Installing dependencies...' },
    { level: 'warn', message: 'npm WARN deprecated some-package@1.0.0: Use the new package instead.' },
    { level: 'info', message: 'Added 91 packages in 16s' },
    { level: 'info', message: '14 packages are looking for funding' },
    { level: 'info', message: '  run `npm fund` for details' },
    { level: 'error', message: 'Warning: Unrecognized Next.js version. Ensure it is defined as a project dependency.' },
    { level: 'info', message: 'Successfully compiled.' },
    { level: 'info', message: 'Collecting page data...' },
    { level: 'info', message: 'Type validation successful.' },
    { level: 'warn', message: 'Warning: Environment variable API_KEY is missing. Some features might fail.' },
    { level: 'info', message: 'Uploading build cache to remote storage...' },
    { level: 'info', message: 'Build cache upload complete.' },
    { level: 'info', message: 'Deploying to Vercel global edge network...' },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeMeeting, setActiveMeeting] = useState<{ id: string; isHost: boolean } | null>(null);
  
  // --- State with Persistence ---
  const [userTheme, setUserTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('najdiTheme') as Theme | null;
    return savedTheme || 'default';
  });
  
  const [userAccount, setUserAccount] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('najdiUserAccount');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(() => {
    try {
      const saved = localStorage.getItem('najdiProjectFiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [storageUsed, setStorageUsed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('najdiStorageUsed');
      return saved ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [messages, setMessages] = useState<{ [key: string]: ConnectChatMessage[] }>(() => {
    try {
        const saved = localStorage.getItem('najdiAllMessages');
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
  });
  
  // --- Build State ---
  const [buildLogs, setBuildLogs] = useState<Log[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProjectName, setBuildProjectName] = useState<string | null>(null);

  // --- State without direct persistence ---
  const [activeTheme, setActiveTheme] = useState<Theme>(userTheme);
  const [maxStorage, setMaxStorage] = useState<number>(DEFAULT_STORAGE);

  // Set storage based on user account on load and on change
  useEffect(() => {
    if (userAccount?.email === 'timer6161@gmail.com') {
      setMaxStorage(PREMIUM_STORAGE);
    } else {
      setMaxStorage(DEFAULT_STORAGE);
    }
  }, [userAccount]);

  // --- Effects for Saving to localStorage ---
  useEffect(() => {
    localStorage.setItem('najdiTheme', userTheme);
  }, [userTheme]);

  useEffect(() => {
    if (userAccount) {
      localStorage.setItem('najdiUserAccount', JSON.stringify(userAccount));
    } else {
      localStorage.removeItem('najdiUserAccount');
    }
  }, [userAccount]);

  useEffect(() => {
    localStorage.setItem('najdiProjectFiles', JSON.stringify(projectFiles));
  }, [projectFiles]);

  useEffect(() => {
    localStorage.setItem('najdiStorageUsed', JSON.stringify(storageUsed));
  }, [storageUsed]);
  
  useEffect(() => {
    localStorage.setItem('najdiAllMessages', JSON.stringify(messages));
  }, [messages]);

  const navigateTo = useCallback((page: Page, options?: any) => {
    if (page === 'meeting' && options?.meetingId) {
      setActiveMeeting({ id: options.meetingId, isHost: options.isHost });
    } else {
      setActiveMeeting(null);
    }
    setCurrentPage(page);
  }, []);

    const startBuildProcess = async (projectName: string) => {
        setIsBuilding(true);
        setBuildLogs([]);
        setBuildProjectName(projectName);
        navigateTo('build-logs');

        const logTemplate = getLogTemplate(projectName);
        const allLogs: Log[] = [];

        for (const log of logTemplate) {
            const delay = 50 + Math.random() * 450;
            await new Promise(res => setTimeout(res, delay));
            const newLog: Log = {
                ...log,
                timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }) + `.${String(Date.now()).slice(-3)}`
            };
            allLogs.push(newLog);
            setBuildLogs([...allLogs]);
        }
        
        await new Promise(res => setTimeout(res, 1000));
        const successLog: Log = {
            level: 'info',
            timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }) + `.${String(Date.now()).slice(-3)}`,
            message: `Deployment complete! Project available at https://${projectName.toLowerCase().replace(/_/g, '-')}-${crypto.randomUUID().slice(0, 8)}.vercel.app`
        };
        allLogs.push(successLog);
        setBuildLogs([...allLogs]);

        setIsBuilding(false);
    };

  const handleLogin = (account: UserAccount, password?: string) => {
    if (account.email === 'timer6161@gmail.com' && password && password !== 'B7225badr') {
      alert('كلمة المرور أو البريد الإلكتروني غير صحيح.');
      return;
    }
    
    // Manage all users list
    try {
      const allUsersRaw = localStorage.getItem('najdiAllUsers');
      const allUsers: UserAccount[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
      if (!allUsers.some(u => u.email === account.email)) {
        // Store only non-sensitive info for discovery
        allUsers.push({ email: account.email, profileImage: account.profileImage });
        localStorage.setItem('najdiAllUsers', JSON.stringify(allUsers));
      }
    } catch (e) {
      console.error("Failed to update all users list", e);
    }

    const userToSave = { ...account };
    if (!userToSave.contacts) {
        userToSave.contacts = [];
    }
    
    setUserAccount(userToSave);
    if (currentPage !== 'email') {
        setCurrentPage('email');
    }
  };

  const addProjectFile = (file: Omit<ProjectFile, 'id' | 'createdAt'>): boolean => {
      const newSize = storageUsed + file.size;
      if (newSize > maxStorage) {
          alert('لا توجد مساحة تخزين كافية!');
          return false;
      }
      const newFile: ProjectFile = {
          ...file,
          id: Date.now().toString(),
          createdAt: new Date().toLocaleDateString('ar-SA'),
      };
      setProjectFiles(prev => [newFile, ...prev]);
      setStorageUsed(newSize);
      return true;
  };

  const handleAddContact = (contactEmail: string): boolean => {
    if (!userAccount) return false;
    if (contactEmail === userAccount.email) {
        alert("لا يمكنك إضافة نفسك كجهة اتصال.");
        return false;
    }

    const allUsersRaw = localStorage.getItem('najdiAllUsers');
    const allUsers: UserAccount[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];

    if (allUsers.some(u => u.email === contactEmail)) {
        if (!(userAccount.contacts || []).some(c => c.email === contactEmail)) {
            const updatedAccount = {
                ...userAccount,
                contacts: [...(userAccount.contacts || []), { email: contactEmail }]
            };
            setUserAccount(updatedAccount); // This will trigger persistence via useEffect
            return true;
        } else {
            alert('جهة الاتصال موجودة بالفعل.');
            return false;
        }
    } else {
        alert('المستخدم غير موجود. تأكد من أن البريد الإلكتروني صحيح ومسجل في نجد الذكية.');
        return false;
    }
  };
  
  const handleSendMessage = (chatPartnerEmail: string, message: ConnectChatMessage) => {
    if (!userAccount) return;

    const chatKey = [userAccount.email, chatPartnerEmail].sort().join('__najdi__');

    setMessages(prevMessages => {
        const newChatMessages = [...(prevMessages[chatKey] || []), message];
        return {
            ...prevMessages,
            [chatKey]: newChatMessages
        };
    });
  };

  useEffect(() => {
    if (['aigen6', 'aigen6-creative', 'spreadsheet', 'word-processor', 'presentation-builder', 'meeting', 'webapp-builder', 'build-logs'].includes(currentPage)) {
        setActiveTheme('dark');
    } else {
        setActiveTheme(userTheme);
    }
  }, [currentPage, userTheme]);

  const themeGradients: Record<Theme, string> = {
    default: 'bg-gradient-default',
    classic: 'bg-gradient-classic',
    modern: 'bg-gradient-modern',
    dark: 'bg-gradient-dark',
    'interactive-dark': 'bg-gradient-interactive-dark',
    'blue-purple-interactive': 'bg-gradient-blue-purple-interactive',
  };

  useEffect(() => {
    const themeColors: Record<Theme, string> = {
      default: 'rgb(24 16 12)',
      classic: 'rgb(10 15 30)',
      modern: 'rgb(8 28 34)',
      dark: 'rgb(10 15 30)',
      'interactive-dark': 'rgb(12 5 28)',
      'blue-purple-interactive': 'rgb(22 18 48)',
    };
    document.body.style.backgroundColor = themeColors[activeTheme];
  }, [activeTheme]);


  return (
    <div 
      data-theme={activeTheme} 
      className={`relative min-h-screen w-full text-[rgb(var(--color-text-main))] animated-background ${themeGradients[activeTheme]}`}
    >
      <Header onNavigate={navigateTo} theme={userTheme} setTheme={setUserTheme} />
      {(!['aigen6', 'aigen6-creative', 'spreadsheet', 'word-processor', 'presentation-builder', 'meeting', 'webapp-builder', 'build-logs'].includes(currentPage)) && <DigitalDesert theme={activeTheme} />}
      
      {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
      {currentPage === 'search' && <SearchPage onNavigate={navigateTo} />}
      {currentPage === 'email' && <NajdiConnectPage userAccount={userAccount} onLogin={handleLogin} projectFiles={projectFiles} onNavigate={navigateTo} messages={messages} onSendMessage={handleSendMessage} onAddContact={handleAddContact} />}
      {currentPage === 'speedtest' && <NajdiSpeedTestPage onNavigate={navigateTo} />}
      {currentPage === 'live' && <LiveConversationPage onNavigate={navigateTo} />}
      {currentPage === 'tts' && <TtsPage onNavigate={navigateTo} />}
      {currentPage === 'business' && <BusinessPage onNavigate={navigateTo} onSaveToProjectSpace={addProjectFile} />}
      {currentPage === 'aigen6' && <AiGen6Page onNavigate={navigateTo} />}
      {currentPage === 'aigen6-creative' && <AiGen6CreativePage onNavigate={navigateTo} />}
      {currentPage === 'projectspace' && <ProjectSpacePage files={projectFiles} onAddFile={addProjectFile} storageUsed={storageUsed} maxStorage={maxStorage} />}
      {currentPage === 'cr' && <CorporateResearchPage onNavigate={navigateTo} onSaveToProjectSpace={addProjectFile} />}
      {currentPage === 'spreadsheet' && <SpreadsheetPage onNavigate={navigateTo} onSaveToProjectSpace={addProjectFile} />}
      {currentPage === 'word-processor' && <WordProcessorPage onNavigate={navigateTo} onSaveToProjectSpace={addProjectFile} />}
      {currentPage === 'presentation-builder' && <PresentationBuilderPage onNavigate={navigateTo} onSaveToProjectSpace={addProjectFile} />}
      {currentPage === 'webapp-builder' && <WebAppBuilderPage onNavigate={navigateTo} onSaveToProjectSpace={addProjectFile} onDeploy={startBuildProcess} />}
      {currentPage === 'build-logs' && <BuildLogsPage onNavigate={navigateTo} logs={buildLogs} isBuilding={isBuilding} projectName={buildProjectName} />}
      {currentPage === 'meeting' && activeMeeting && <MeetingPage meetingId={activeMeeting.id} onLeave={() => navigateTo('email')} isHost={activeMeeting.isHost} />}

    </div>
  );
}

export default App;