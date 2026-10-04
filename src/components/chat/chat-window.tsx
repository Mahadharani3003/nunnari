"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { EmptyState } from './empty-state';
import { TypingIndicator } from './typing-indicator';
import { Message, Attachment } from '@/types/chat';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ChatWindowProps {
  userId: string;
  conversationId?: string;
  initialMessages?: Message[];
}

export function ChatWindow({ userId, conversationId, initialMessages = [] }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleSend = async (content: string, attachments?: Attachment[]) => {
    const userMessage: Message = { id: generateId(), role: 'user', content, attachments };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setError(null);
    setIsLoading(true);
    
    let currentConversationId = conversationId;

    try {
      // 1. Create conversation if it doesn't exist
      if (!currentConversationId) {
        const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .insert({ user_id: userId, title })
          .select()
          .single();
          
        if (convError) throw new Error('Failed to create conversation');
        currentConversationId = convData.id;
        
        // Update URL without reloading page
        window.history.pushState({}, '', `/chat/${currentConversationId}`);
        // router.refresh(); // optionally refresh layout
      }

      // 2. Save User Message
      await supabase.from('messages').insert({
        conversation_id: currentConversationId,
        role: 'user',
        content,
        metadata: { attachments }
      });

      // 3. Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, conversationId: currentConversationId })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available');

      const decoder = new TextDecoder();
      let done = false;
      const assistantId = generateId();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', steps: [] }
      ]);
      
      let fullAssistantContent = '';
      let finalSteps: any[] = [];

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'step') {
                  setMessages(prev => prev.map(m => {
                    if (m.id === assistantId) {
                      const existingSteps = m.steps || [];
                      const stepIndex = existingSteps.findIndex(s => s.label === data.data.label);
                      const newSteps = [...existingSteps];
                      if (stepIndex >= 0) {
                        newSteps[stepIndex] = { ...newSteps[stepIndex], status: data.data.status };
                      } else {
                        newSteps.push(data.data);
                      }
                      finalSteps = newSteps;
                      return { ...m, steps: newSteps };
                    }
                    return m;
                  }));
                } else if (data.type === 'content') {
                  fullAssistantContent = data.data;
                  setMessages(prev => prev.map(m => 
                    m.id === assistantId ? { ...m, content: data.data } : m
                  ));
                } else if (data.type === 'error') {
                  throw new Error(data.data); // This will be caught by the new catch below
                }
              } catch (e) {
                if (e instanceof Error && e.message !== 'Unexpected end of JSON input' && !e.message.includes('JSON')) {
                  throw e; // Rethrow actual errors instead of swallowing them
                }
                // ignore parse error on partial chunks
              }
            }
          }
        }
      }
      
      // 4. Save Assistant Message
      await supabase.from('messages').insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: fullAssistantContent,
        metadata: { steps: finalSteps }
      });
      
      router.refresh();

    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong while contacting Nunnari. Please try again.');
      } else {
        setError('Something went wrong while contacting Nunnari. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header inside chat area for mobile toggle support? Already handled by sidebar overlay */}
      <header className="md:hidden flex items-center justify-center px-6 py-4 border-b bg-background h-[60px]">
        <h1 className="text-xl font-bold tracking-tight ml-8">NUNNARI AI</h1>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto">
        {!isMounted ? null : messages.length === 0 ? (
          <EmptyState onExampleClick={handleSend} />
        ) : (
          <div className="flex flex-col pb-4">
            {messages.map((message, index) => {
              const isLatestAssistant = message.role === 'assistant' && index === messages.length - 1;
              return (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  isLatestAssistant={isLatestAssistant}
                />
              );
            })}
            
            {isLoading && (
              <div className="max-w-4xl w-full mx-auto px-4">
                <TypingIndicator />
              </div>
            )}
            
            {error && (
              <div className="max-w-4xl w-full mx-auto px-4 py-4 mt-2">
                <div className="p-4 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
                  {error}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="p-4 bg-background">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
