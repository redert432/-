import type { ReactNode } from 'react';

export interface WebSource {
  type: 'web';
  uri: string;
  title: string;
}

export interface MapSource {
  type: 'maps';
  uri: string;
  title: string;
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

export interface ChatMessage {
    id: string;
    sender: 'me' | 'them';
    type: 'text' | 'file';
    content: string; // for text, it's the message; for file, it's the file name
    file?: ProjectFile; // Attach the file object if it's a file message
    timestamp: string;
}

export interface Slide {
    id: string;
    title: string;
    content: string;
}