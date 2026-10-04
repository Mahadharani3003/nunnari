import { Message } from '@/types/chat';

export interface GenerateOptions {
  systemInstruction?: string;
  tools?: string[];
  responseFormat?: 'json' | 'text';
}

export interface LLMProvider {
  generate(messages: Message[], options?: GenerateOptions): Promise<string>;
  generateStructured<T>(messages: Message[], options?: GenerateOptions): Promise<T>;
  supportsTools(): boolean;
}
