import React from 'react';
import ChatBubble from './ChatBubble';

const NajdiAiPage: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Najdi AI Chat</h1>
      <ChatBubble sender="ai" message="Welcome to Najdi AI. How can I help you?" />
      <ChatBubble sender="user" message="Tell me about the history of Diriyah." />
    </div>
  );
};

export default NajdiAiPage;
