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
import WebAppBuilderPage from './components/WebAppBuilderPage'; // Import the new page
import { UserAccount, ProjectFile } from './types';
import MeetingPage from './components/MeetingPage';

export type Page = 'home' | 'search' | 'email' | 'speedtest' | 'live' | 'tts' | 'business' | 'aigen6' | 'aigen6-creative' | 'projectspace' | 'cr' | 'spreadsheet' | 'word-processor' | 'presentation-builder' | 'meeting' | 'webapp-builder';
export type Theme = 'default' | 'classic' | 'modern' | 'dark' | 'interactive-dark' | 'blue-purple-interactive';

const DEFAULT_STORAGE = 50 * 1024 * 1024 * 1024; // 50 GB
const PREMIUM_STORAGE = 1024 * 1024 * 1024 * 1024; // 1 TB

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

  const navigateTo = useCallback((page: Page, options?: any) => {
    if (page === 'meeting' && options?.meetingId) {
      setActiveMeeting({ id: options.meetingId, isHost: options.isHost });
    } else {
      setActiveMeeting(null);
    }
    setCurrentPage(page);
  }, []);

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

  useEffect(() => {
    if (['aigen6', 'aigen6-creative', 'spreadsheet', 'word-processor', 'presentation-builder', 'meeting', 'webapp-builder'].includes(currentPage)) {
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
      {(!['aigen6', 'aigen6-creative', 'spreadsheet', 'word-processor', 'presentation-builder', 'meeting', 'webapp-builder'].includes(currentPage)) && <DigitalDesert theme={activeTheme} />}
      
      {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
      {currentPage === 'search' && <SearchPage onNavigate={navigateTo} />}
      {currentPage === 'email' && <NajdiConnectPage userAccount={userAccount} onLogin={handleLogin} projectFiles={projectFiles} onNavigate={navigateTo} />}
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
      {currentPage === 'webapp-builder' && <WebAppBuilderPage onNavigate={navigateTo} onSaveToProjectSpace={addProjectFile} />}
      {currentPage === 'meeting' && activeMeeting && <MeetingPage meetingId={activeMeeting.id} onLeave={() => navigateTo('email')} isHost={activeMeeting.isHost} />}

    </div>
  );
}

export default App;