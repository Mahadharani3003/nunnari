import { GoogleGenAI } from '@google/genai';
import { LLMProvider, GenerateOptions } from './provider';
import { Message } from '@/types/chat';

export class GeminiProvider implements LLMProvider {
  private ai: unknown;
  private modelName: string;

  constructor(modelName: string = 'gemini-flash-latest') {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }
    this.ai = new GoogleGenAI();
    this.modelName = modelName;
  }

  supportsTools(): boolean {
    return true;
  }

  private prepareContents(messages: Message[]) {
    return messages.map(msg => {
      const parts: Record<string, unknown>[] = [];
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          parts.push({
            inlineData: {
              mimeType: att.type,
              data: att.data
            }
          });
        });
      }
      return {
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts
      };
    });
  }

  private mapTools(tools?: string[]) {
    if (!tools || tools.length === 0) return undefined;
    return tools.map(tool => {
      if (tool === 'web_search') return { googleSearch: {} };
      if (tool === 'code_execution') return { codeExecution: {} };
      return null;
    }).filter(Boolean);
  }

  async generate(messages: Message[], options?: GenerateOptions): Promise<string> {
    const contents = this.prepareContents(messages);
    const mappedTools = this.mapTools(options?.tools);

    const aiClient = this.ai as any;
    const response = await aiClient.models.generateContent({
      model: this.modelName,
      contents,
      config: {
        systemInstruction: options?.systemInstruction,
        tools: mappedTools,
      }
    });

    return response.text || '';
  }

  async generateStructured<T>(messages: Message[], options?: GenerateOptions): Promise<T> {
    const contents = this.prepareContents(messages);
    
    const aiClient = this.ai as any;
    const response = await aiClient.models.generateContent({
      model: this.modelName,
      contents,
      config: {
        systemInstruction: options?.systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    try {
      const text = response.text || '{}';
      // simple cleanup for potential markdown wrap
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText) as T;
    } catch (e) {
      console.error('Failed to parse structured output:', e);
      throw new Error('LLM did not return valid JSON');
    }
  }
}
