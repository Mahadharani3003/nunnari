export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  name: string;
  type: string;
  data: string; // base64 string
}

export interface TaskStep {
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  steps?: TaskStep[];
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatResponse {
  content: string;
  error?: string;
}
