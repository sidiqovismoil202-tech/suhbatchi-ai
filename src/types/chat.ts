export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface QuickPrompt {
  id: string;
  category: string;
  icon: string;
  title: string;
  prompt: string;
  tagColor: string;
}
