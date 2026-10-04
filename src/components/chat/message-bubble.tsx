import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, RefreshCw, User, Bot, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isLatestAssistant: boolean;
  onRegenerate?: () => void;
}

export function MessageBubble({ message, isLatestAssistant, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={cn("flex w-full py-4 px-4", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] md:max-w-[75%] gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <User size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary-foreground flex items-center justify-center text-secondary shadow-sm">
              <Bot size={18} />
            </div>
          )}
        </div>
        
        <div className={cn("flex flex-col min-w-[200px]", isUser ? "items-end" : "items-start")}>
          <div className="font-medium text-xs text-muted-foreground mb-1 mx-1">
            {isUser ? 'You' : 'NUNNARI AI'}
          </div>
          
          <div className={cn(
            "flex flex-col gap-3 px-4 py-3 rounded-2xl shadow-sm w-full",
            isUser 
              ? "bg-primary text-primary-foreground rounded-tr-sm" 
              : "bg-muted/80 rounded-tl-sm border"
          )}>
            {message.attachments && message.attachments.length > 0 && (
              <div className={cn("flex flex-wrap gap-2", isUser ? "justify-end" : "justify-start")}>
                {message.attachments.map((att, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    {att.type.startsWith('image/') ? (
                      <img 
                        src={`data:${att.type};base64,${att.data}`} 
                        alt={att.name} 
                        className={cn(
                          "max-w-[200px] max-h-[200px] rounded-lg object-cover border",
                          isUser ? "border-primary-foreground/20" : "border-border"
                        )} 
                      />
                    ) : (
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border",
                        isUser 
                          ? "bg-primary-foreground/10 border-primary-foreground/20" 
                          : "bg-background border-border"
                      )}>
                        <span className="font-medium max-w-[150px] truncate">{att.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {message.steps && message.steps.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2 bg-background/40 p-3 rounded-lg border border-border/30 text-sm shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground mb-1">TASK PROGRESS</div>
                {message.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {step.status === 'completed' && <CheckCircle2 size={14} className="text-green-500" />}
                    {step.status === 'active' && <Loader2 size={14} className="animate-spin text-primary" />}
                    {step.status === 'pending' && <Circle size={14} className="text-muted-foreground" />}
                    {step.status === 'error' && <Circle size={14} className="text-destructive" />}
                    <span className={cn(
                      "text-muted-foreground", 
                      step.status === 'active' && "text-foreground font-medium",
                      step.status === 'error' && "text-destructive"
                    )}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {message.content && (
              <div className={cn(
                "prose prose-sm max-w-none break-words",
                isUser ? "prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground prose-a:text-primary-foreground" : "dark:prose-invert"
              )}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {!isUser && (
            <div className="flex space-x-2 mt-2 text-muted-foreground ml-1">
              <button 
                onClick={handleCopy}
                className="flex items-center justify-center hover:bg-muted p-1.5 rounded-md transition-colors"
                aria-label="Copy response"
                title="Copy to clipboard"
              >
                <Copy size={14} />
              </button>
              {isLatestAssistant && onRegenerate && (
                <button 
                  onClick={onRegenerate}
                  className="flex items-center justify-center hover:bg-muted p-1.5 rounded-md transition-colors"
                  aria-label="Regenerate response"
                  title="Regenerate"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
