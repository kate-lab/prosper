'use client';

import { MobileScreen } from '@/components/mobile-screen';
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef } from 'react';
import React from 'react'; // Explicitly import React

export default function Concept3Page() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    body: {
      conceptId: 'concept3', // Pass the concept ID to the API route
    },
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }

    // Stop any ongoing speech
    if (currentUtterance) {
      window.speechSynthesis.cancel();
      setCurrentUtterance(null);
      setIsSpeaking(false);
      setAudioProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(voice => voice.lang === 'en-GB' && voice.name.includes('Google') || voice.name.includes('Microsoft')); // Prioritize Google/Microsoft GB voices

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
        // Simulate progress based on utterance length
        setAudioProgress(prev => Math.min(prev + 1, 100));
      }, utterance.text.length * 5); // Adjust speed of progress simulation
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
    // When a new assistant message arrives, speak it
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.parts[0]?.type === 'text') {
      speakText(lastMessage.parts[0].text);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Clean up on component unmount
    return () => {
      if (currentUtterance) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentUtterance]);

  const handleQuestionClick = (question: string) => {
    sendMessage({ text: question });
  };

  const suggestedQuestions = [
    "Could you tell me a bit about yourself and your background?",
    "Tell me about your experience with X",
    "What are your strengths and weaknesses?",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-prosper-bg-page"> {/* Updated background color */}
      <MobileScreen className="mt-4">
        <div className="flex flex-col h-full bg-white"> {/* This is the inner app interface background */}
          {/* Top bar with call status */}
          <div className="flex items-center justify-between p-4 border-b border-prosper-gray-light">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-prosper-text-dark">Interview in progress</span>
            </div>
            <span className="text-sm font-medium text-prosper-text-dark">00:01:23</span>
          </div>

          {/* Main interaction area */}
          <div className="relative flex-1 flex flex-col items-center justify-center bg-prosper-bg-medium text-white p-4">
            {/* Professional virtual coach image */}
            <Image
              src="/maria_720.png"
              alt="Professional virtual coach Maria"
              width={300}
              height={300}
              className="w-48 h-48 rounded-full object-cover border-4 border-prosper-gray-medium mb-6"
            />

            {/* AI Audio Message Bubble (WhatsApp style) */}
            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
              <div className="bg-prosper-concept3-blue text-white p-3 rounded-lg shadow-lg max-w-[90%] flex items-center space-x-3 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-prosper-concept3-blue-dark"
                  onClick={toggleSpeech}
                  disabled={status === 'streaming'}
                >
                  {isSpeaking && !window.speechSynthesis.paused ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <div
                  className="flex-1 h-2 bg-prosper-concept3-blue-dark rounded-full overflow-hidden"
                  style={{ width: `${audioProgress}%` }} // Apply progress directly
                >
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `100%` }} // This inner div should always be 100% if the outer div is already sized by progress
                  ></div>
                </div>
                <span className="text-xs">0:30</span> {/* Simulated duration */}
              </div>
            )}
            {status === 'streaming' && (
              <div className="bg-prosper-bg-medium p-3 rounded-lg max-w-[90%] flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-prosper-gray-medium" />
              </div>
            )}

            {/* User's last message (optional, for context) */}
            {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="bg-prosper-concept3-blue text-white p-3 rounded-lg shadow-lg max-w-[90%] self-end mt-2">
                <p className="text-sm">
                  {messages[messages.length - 1].parts[0]?.type === 'text' ? messages[messages.length - 1].parts[0].text : ''}
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interaction buttons/fields */}
          <div className="p-4 border-t border-prosper-gray-light flex flex-col space-y-3 w-full">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                className="w-full bg-prosper-concept3-blue hover:bg-prosper-concept3-blue-dark text-white text-lg py-3"
                onClick={() => handleQuestionClick(question)}
                disabled={status === 'streaming' || isSpeaking}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </MobileScreen>
    </div>
  );
}
