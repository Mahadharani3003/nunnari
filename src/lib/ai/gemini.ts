import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './prompts';
import { Message } from '@/types/chat';

// Initialize the SDK. It automatically picks up GEMINI_API_KEY from the environment.
// Ensure we don't crash at build time if the key is missing.
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }
  return new GoogleGenAI();
};

const MODEL_NAME = 'gemini-flash-latest';

export async function generateChatResponse(messages: Message[]) {
  try {
    const ai = getClient();
    
    // Map messages to Gemini's format.
    // The role 'assistant' is mapped to 'model'.
    const contents = messages.map(msg => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = [];
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

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }, { codeExecution: {} }]
      }
    });

    return response.text;
  } catch (error: unknown) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
      throw error; // Throw the actual error so it reaches the route handler
    }
    throw new Error('Something went wrong while contacting Nunnari. Please try again.');
  }
}
