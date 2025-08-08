'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef } from 'react';
import { MobileScreen } from '@/components/mobile-screen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function Concept1Page() {
  const initialAssistantMessageContent = 'Hi Ava, ready to do some more practicing how to introduce yourself?';

  // State to track if the user has sent their first message (after the static greeting)
  const [isFirstUserMessageSent, setIsFirstUserMessageSent] = useState(false);
  // Ref to store the original content of the first user message for display
  const originalFirstUserInputRef = useRef<string | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    body: {
      conceptId: 'concept1', // Pass the concept ID to the API route
    },
    // No initialMessages here; the first greeting is static UI
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      const originalInput = input.trim();
      let messageToSendToAI = originalInput;

      // If it's the user's first message (after the static greeting), append the specific phrase for the AI
      if (!isFirstUserMessageSent) {
        originalFirstUserInputRef.current = originalInput; // Store original for display
        messageToSendToAI += ' i would like to practice introducing myself';
        setIsFirstUserMessageSent(true); // Mark that the first user message has been sent
      }

      sendMessage({ text: messageToSendToAI });
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-prosper-bg-page">
      <MobileScreen className="pt-4">
        <div className="flex flex-col h-full bg-white">
          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">

            {/* Large blob character and initial message - ALWAYS RENDERED FIRST (STATIC UI) */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex-shrink-0 w-60 h-60 rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/blob-character.png"
                  alt="Friendly blob character"
                  width={60}
                  height={60}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* initial message*/}
              <div className="flex space-x-2">
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
                    {initialAssistantMessageContent}
                  </p>
                </div>
              </div>
            </div>

            {/* Render all messages from the useChat hook (which starts empty) */}
            {messages.map((message, index) => {
              // Check if this is the very first message in the `messages` array from useChat, AND it's a user message, AND the flag is set
              const isFirstUserMessageInChat = message.role === 'user' && index === 0 && isFirstUserMessageSent;

              // Determine the text to display for the message
              const displayedText = isFirstUserMessageInChat && originalFirstUserInputRef.current
                ? originalFirstUserInputRef.current
                : message.parts.find(part => part.type === 'text')?.text || '';

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden mr-2">
                      <Image
                        src="/blob-character.png"
                        alt="Friendly blob character"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {/* Message content bubble - always rendered */}
                  <div
                    className={`p-3 rounded-lg text-sm max-w-[70%] ${
                      message.role === 'user'
                        ? 'bg-prosper-concept1-green text-white'
                        : 'bg-prosper-bg-medium text-prosper-text-dark'
                    }`}
                  >
                    <ReactMarkdown>{displayedText}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
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
