'use client';

import { MobileScreen } from '@/components/mobile-screen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Corrected Input import
import { Play, Pause, Loader2, PhoneCall, Send } from 'lucide-react';
import Image from 'next/image';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef } from 'react';
import React from 'react';

export default function Concept3Page() {
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    body: {
      conceptId: 'concept3',
    },
  });

  const [showCallScreen, setShowCallScreen] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialQuestionSentRef = useRef(false);

  const [input, setInput] = useState('');

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(unit => String(unit).padStart(2, '0'))
      .join(':');
  };

  useEffect(() => {
    if (!showCallScreen) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setElapsedTime(0);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [showCallScreen]);

  useEffect(() => {
    if (!showCallScreen && !initialQuestionSentRef.current) {
      const initialQuestionText = "Hello! Welcome to Prosper. Let's start with a quick introduction. Could you tell me a bit about yourself and your background?";
      setMessages([{
        role: 'assistant',
        content: initialQuestionText,
        id: 'initial-maria-message',
        parts: [{ type: 'text', text: initialQuestionText }]
      }]);
      initialQuestionSentRef.current = true;
    }
  }, [showCallScreen, setMessages]);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }

    if (currentUtterance) {
      window.speechSynthesis.cancel();
      setCurrentUtterance(null);
      setIsSpeaking(false);
      setAudioProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(voice => voice.lang === 'en-GB' && voice.name.includes('Google') || voice.name.includes('Microsoft'));

    if (britishVoice) {
      utterance.voice = britishVoice;
    } else {
      console.warn('British English voice not found, using default.');
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setAudioProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        setAudioProgress(prev => Math.min(prev + 1, 100));
      }, utterance.text.length * 5);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setAudioProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance error:', event);
      setIsSpeaking(false);
      setAudioProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
    setCurrentUtterance(utterance);
  };

  const toggleSpeech = () => {
    if (currentUtterance) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsSpeaking(true);
      } else if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setIsSpeaking(false);
      }
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.parts && lastMessage.parts[0]?.type === 'text') {
      speakText(lastMessage.parts[0].text);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (currentUtterance) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentUtterance]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-prosper-bg-page">
      <MobileScreen className="mt-4">
        {showCallScreen ? (
          <div className="flex flex-col h-full items-center justify-center bg-prosper-concept3-blue text-white p-4">
            <Image
              src="/maria_720.png"
              alt="Professional virtual coach Maria"
              width={200}
              height={200}
              className="w-48 h-48 rounded-full object-cover border-4 border-white mb-6"
            />
            <h2 className="text-2xl font-semibold mb-2">Incoming Call...</h2>
            <p className="text-lg mb-8">Maria is calling</p>
            <Button
              className="w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg"
              onClick={() => setShowCallScreen(false)}
            >
              <PhoneCall className="h-12 w-12 text-white" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b border-prosper-gray-light">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-prosper-text-dark">Call in progress</span>
              </div>
              <span className="text-sm font-medium text-prosper-text-dark">{formatTime(elapsedTime)}</span>
            </div>

            <div className="relative flex-1 flex flex-col items-center justify-center bg-prosper-bg-medium text-white p-4">
              <Image
                src="/maria_720.png"
                alt="Professional virtual coach Maria"
                width={300}
                height={300}
                className="w-48 h-48 rounded-full object-cover border-4 border-prosper-gray-medium mb-6"
              />

              {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                (() => {
                  const lastAssistantMessage = messages[messages.length - 1];
                  const lastAssistantTextPart = lastAssistantMessage.parts?.find(part => part.type === 'text');

                  if (!lastAssistantTextPart) return null;

                  return (
                    <div className="bg-prosper-concept3-blue text-white p-3 rounded-lg shadow-lg max-w-[90%] flex flex-col items-center space-y-2 mb-4">
                      <div className="flex items-center space-x-3 w-full">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-prosper-concept3-blue-dark"
                          onClick={toggleSpeech}
                          disabled={status === 'streaming'}
                        >
                          {isSpeaking && !window.speechSynthesis.paused ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <div className="flex-1 h-2 bg-prosper-concept3-blue-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                            style={{ width: `${audioProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">0:30</span>
                      </div>
                      <p className="text-sm text-center w-full">
                        {lastAssistantTextPart.text}
                      </p>
                    </div>
                  );
                })()
              )}
              {status === 'streaming' && (
                <div className="bg-prosper-bg-medium p-3 rounded-lg max-w-[90%] flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-prosper-gray-medium" />
                </div>
              )}

              {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div className="bg-prosper-concept3-blue text-white p-3 rounded-lg shadow-lg max-w-[90%] self-end mt-2">
                  <p className="text-sm">
                    {messages[messages.length - 1].parts?.find(part => part.type === 'text')?.text || ''}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-prosper-gray-light flex items-center space-x-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 bg-prosper-bg-medium text-prosper-text-dark border-prosper-gray-medium"
                disabled={status !== 'ready' && status !== 'streaming'}
              />
              <Button type="submit" disabled={status !== 'ready' && status !== 'streaming'} className="bg-prosper-concept3-blue hover:bg-prosper-concept3-blue-dark text-white">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        )}
      </MobileScreen>
    </div>
  );
}
