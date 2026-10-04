import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-4 text-muted-foreground text-sm">
      <span className="flex space-x-1">
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </span>
      <span>Nunnari is thinking...</span>
    </div>
  );
}
