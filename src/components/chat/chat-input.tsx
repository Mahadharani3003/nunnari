import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, X } from 'lucide-react';
import { Attachment } from '@/types/chat';

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if ((input.trim() || attachments.length > 0) && !disabled) {
      onSend(input.trim(), attachments);
      setInput('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = await Promise.all(
      files.map(async (file) => {
        return new Promise<Attachment>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = (event.target?.result as string).split(',')[1];
            resolve({
              name: file.name,
              type: file.type,
              data: base64Data
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 bg-background border-t">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm border shadow-sm">
                <span className="max-w-[150px] truncate">{att.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={disabled}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="relative flex items-end bg-muted/50 border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf,text/plain"
            disabled={disabled}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-4 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            aria-label="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask Nunnari anything..."
            className="w-full max-h-[200px] bg-transparent resize-none outline-none py-4 pr-12 text-foreground disabled:opacity-50"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || disabled}
            className="absolute right-2 bottom-2 p-2 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
            aria-label="Send message"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
