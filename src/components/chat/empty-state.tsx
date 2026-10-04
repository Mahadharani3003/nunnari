import React from 'react';
import { Sparkles, Mail, Lightbulb, Code } from 'lucide-react';

interface EmptyStateProps {
  onExampleClick: (text: string) => void;
}

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  const examples = [
    {
      icon: <Sparkles className="w-5 h-5 mb-2" />,
      text: "Explain quantum computing simply"
    },
    {
      icon: <Mail className="w-5 h-5 mb-2" />,
      text: "Help me write a professional email"
    },
    {
      icon: <Lightbulb className="w-5 h-5 mb-2" />,
      text: "Give me project ideas using AI"
    },
    {
      icon: <Code className="w-5 h-5 mb-2" />,
      text: "Explain recursion with an example"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <h1 className="text-4xl font-bold mb-2 tracking-tight">NUNNARI AI</h1>
      <h2 className="text-xl text-muted-foreground mb-4">Your General-Purpose AI Assistant</h2>
      <p className="text-sm text-muted-foreground mb-8">Ask anything. Learn anything. Create anything.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {examples.map((example, i) => (
          <button
            key={i}
            onClick={() => onExampleClick(example.text)}
            className="flex flex-col items-start p-4 text-left border rounded-xl hover:bg-muted transition-colors"
          >
            {example.icon}
            <span className="text-sm">{example.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
