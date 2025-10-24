import type { ReactNode } from 'react';

export interface WebSource {
  type: 'web';
  uri: string;
  title: string;
}

export interface MapSource {
  type: 'maps';
  uri: string;
  title:string;
  placeAnswerSources?: {
    reviewSnippets: {
      text: string;
      author: string;
      rating?: number;
    }[];
  }[];
}

export type Source = WebSource | MapSource;

export interface SearchResult {
  text: string;
  sources: Source[];
  imageUrl?: string;
}

export interface Favorite {
  title: string;
  query: string;
}

export interface BusinessDocument {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    icon: ReactNode;
}

export interface ProjectFile {
    id: string;
    name: string;
    type: string; // e.g., 'pdf', 'docx', 'png'
    size: number; // in bytes
    content?: string; // for text-based documents
    createdAt: string;
}

export interface UserAccount {
    email: string;
    profileImage: string | null;
    contacts?: Contact[];
}

export interface Contact {
    email: string;
}

export interface ConnectChatMessage {
    id: string;
    sender: 'me' | 'them';
    type: 'text' | 'file';
    content: string;
    file?: ProjectFile;
    timestamp: string;
}

export interface AiChatMessage {
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


export interface Slide {
    id: string;
    title: string;
    content: string;
}

// --- Build Log Types ---
export type LogLevel = 'info' | 'warn' | 'error';

export interface Log {
  timestamp: string;
  level: LogLevel;
  message: string;
}