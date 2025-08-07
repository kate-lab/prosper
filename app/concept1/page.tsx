'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef } from 'react';
import { MobileScreen } from '@/components/mobile-screen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react'; // Explicitly import React

export default function Concept1Page() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    body: {
      conceptId: 'concept1', // Pass the concept ID to the API route
    },
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "I feel like I’m not good enough for the jobs I’m applying to",
    "How can I calm my nerves before an interview?",
    "I always blank when they ask me about myself, how do I stop that?",
    "How do I sound confident without coming across as arrogant?",
  ];

  const handleSuggestedPromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-prosper-bg-page"> {/* Updated background color */}
      <MobileScreen className="mt-4">
        <div className="flex flex-col h-full bg-white"> {/* This is the inner app interface background */}
          {/* Top bar with back button and progress bar */}
          <div className="flex items-center p-4 border-b border-prosper-gray-light">
            <div className="flex-1 h-2 bg-prosper-gray-medium rounded-full">
              <div className="h-full w-1/3 bg-prosper-concept1-green rounded-full"></div>
            </div>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Blob character and initial message */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/blob-character.png"
                  alt="Friendly blob character"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-prosper-bg-medium p-3 rounded-lg max-w-[70%]">
                <p className="text-sm text-prosper-text-dark">
                  Morning! Would you like to practice introducing yourself?
                </p>
              </div>
            </div>

            {/* Suggested Prompts */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                key="prompt-0"
                variant="outline"
                className="rounded-full text-sm px-3 py-1 h-auto border-prosper-gray-medium text-prosper-text-dark hover:bg-prosper-bg-medium"
                onClick={() => handleSuggestedPromptClick(suggestedPrompts[0])}
              >
                {suggestedPrompts[0]}
              </Button>
              <Button
                key="prompt-1"
                variant="outline"
                className="rounded-full text-sm px-3 py-1 h-auto border-prosper-gray-medium text-prosper-text-dark hover:bg-prosper-bg-medium"
                onClick={() => handleSuggestedPromptClick(suggestedPrompts[1])}
              >
                {suggestedPrompts[1]}
              </Button>
              <Button
                key="prompt-2"
                variant="outline"
                className="rounded-full text-sm px-3 py-1 h-auto border-prosper-gray-medium text-prosper-text-dark hover:bg-prosper-bg-medium"
                onClick={() => handleSuggestedPromptClick(suggestedPrompts[2])}
              >
                {suggestedPrompts[2]}
              </Button>
              <Button
                key="prompt-3"
                variant="outline"
                className="rounded-full text-sm px-3 py-1 h-auto border-prosper-gray-medium text-prosper-text-dark hover:bg-prosper-bg-medium"
                onClick={() => handleSuggestedPromptClick(suggestedPrompts[3])}
              >
                {suggestedPrompts[3]}
              </Button>
            </div>

            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[70%] ${
                    message.role === 'user'
                      ? 'bg-prosper-concept1-green text-white'
                      : 'bg-prosper-bg-medium text-prosper-text-dark'
                  }`}
                >
                  {message.parts.map((part, index) =>
                    part.type === 'text' ? <span key={index}>{part.text}</span> : null,
                  )}
                </div>
              </div>
            ))}
            {status === 'streaming' && (
              <div className="flex justify-start">
                <div className="bg-prosper-bg-medium p-3 rounded-lg max-w-[70%]">
                  <Loader2 className="h-4 w-4 animate-spin text-prosper-gray-medium" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-prosper-gray-light flex items-center space-x-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type something..."
              className="flex-1 bg-prosper-bg-medium text-prosper-text-dark border-prosper-gray-medium"
              disabled={status !== 'ready' && status !== 'streaming'}
            />
            <Button type="submit" disabled={status !== 'ready' && status !== 'streaming'} className="bg-prosper-concept1-green hover:bg-prosper-concept1-green-dark text-white">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </MobileScreen>
    </div>
  );
}
