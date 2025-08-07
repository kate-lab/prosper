'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MobileScreen } from '@/components/mobile-screen';
import { Button } from '@/components/ui/button';
import { Mic, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { SpeechBubble } from '@/components/speech-bubble';

export default function Concept2Page() {
  // Define the initial message content separately for immediate display
  const initialAssistantMessageContent = "Hi, here are some suggestions on what we can practice today. Should we start with practicing how to introduce yourself?";

  // Initialize chat with the first assistant message
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    body: {
      conceptId: 'concept2', // Pass the concept ID to the API route
    },
    initialMessages: [{
      role: 'assistant',
      content: initialAssistantMessageContent,
      id: 'initial-peer-message',
      parts: [{ type: 'text', text: initialAssistantMessageContent }]
    }]
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false); // New state for processing user's speech
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for the speech timeout

  // Animated Prompts for display (will be hidden after first user message)
  const animatedPrompts = [
    "\"How do I write a good CV?\"",
    "\"What should I say in a cover letter?\"",
    "\"Can you help me prepare for an interview?\"",
    "\"How do I find jobs that fit my skills?\"",
    "\"What's a good way to network?\"",
  ];
  const [currentAnimatedPromptIndex, setCurrentAnimatedPromptIndex] = useState(0);
  const [showAnimatedPrompt, setShowAnimatedPrompt] = useState(true); // For fade effect

  // Determine if user has sent any message (check if messages array has more than just the initial assistant message)
  const hasUserSentMessage = messages.length > 1;

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      newRecognition.continuous = false; // Only capture one utterance at a time
      newRecognition.interimResults = true; // Get interim results
      newRecognition.lang = 'en-US'; // Default to US English for general use

      newRecognition.onstart = () => {
        console.log('[Speech] Recognition started.');
        setIsRecording(true);
        setSpeechError(null);
        setInterimTranscript('');
        setFinalTranscript('');
        setIsProcessingSpeech(false); // Ensure this is false when starting new recording
        // Clear any pending timeout from a previous session
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }
      };

      newRecognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interim);
        setFinalTranscript(final);
        console.log(`[Speech] Interim: "${interim}", Final: "${final}"`);

        // Reset the timeout on every result to extend listening time
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        // Only set a new timeout if we are currently recording
        // This ensures the microphone stops after a period of silence
        speechTimeoutRef.current = setTimeout(() => {
          console.log('[Speech] Silence detected, stopping recognition.');
          recognition?.stop(); // Manually stop recognition after timeout
        }, 1500); // 1.5 seconds thinking time
      };

      newRecognition.onend = () => {
        console.log('[Speech] Recognition ended.');
        setIsRecording(false);
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current); // Clear any pending timeout
          speechTimeoutRef.current = null;
        }
        // Now, after recognition has truly ended, process the final transcript
        if (finalTranscript.trim()) {
          console.log('[Speech] Final transcript available, setting processing state.');
          setIsProcessingSpeech(true);
          handleSendMessage(finalTranscript.trim());
        } else {
          console.log('[Speech] No final transcript, returning to idle.');
          // If no speech was detected, ensure processing state is off
          setIsProcessingSpeech(false);
        }
      };

      newRecognition.onerror = (event) => {
        setIsRecording(false);
        setIsProcessingSpeech(false); // Stop processing state on error
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }
        setSpeechError(`Speech recognition error: ${event.error}`);
        console.error('[Speech] Recognition error:', event.error);
      };

      setRecognition(newRecognition);
    } else {
      setSpeechError('Speech Recognition not supported in this browser.');
      console.warn('[Speech] Speech Recognition not supported.');
    }

    return () => {
      if (recognition) {
        recognition.onstart = null;;
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [finalTranscript]); // Added finalTranscript to dependencies for onend handler

  // Effect for animating prompts - modify to stop if user has sent a message
  useEffect(() => {
    if (hasUserSentMessage) {
      setShowAnimatedPrompt(false); // Hide immediately
      return; // Stop interval
    }
    const interval = setInterval(() => {
      setShowAnimatedPrompt(false); // Start fade out
      setTimeout(() => {
        setCurrentAnimatedPromptIndex(prevIndex =>
          (prevIndex + 1) % animatedPrompts.length
        );
        setShowAnimatedPrompt(true); // Start fade in
      }, 500); // Match duration-500 for fade
    }, 3000); // Change prompt every 3 seconds

    return () => clearInterval(interval);
  }, [animatedPrompts.length, hasUserSentMessage]); // Add hasUserSentMessage to dependencies

  // Reset isProcessingSpeech when AI starts streaming or is ready again
  useEffect(() => {
    if (status === 'streaming' || status === 'ready') {
      setIsProcessingSpeech(false);
    }
  }, [status]);

  const startRecording = () => {
    if (recognition && !isRecording) {
      setInterimTranscript('');
      setFinalTranscript('');
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
  };

  const handleSendMessage = useCallback((text: string) => {
    sendMessage({ text: text, body: { conceptId: 'concept2' } });
    // Clear final transcript after sending, so it doesn't persist if user doesn't speak again
    setFinalTranscript('');
  }, [sendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, finalTranscript, isProcessingSpeech]); // Scroll when messages or transcripts change

  // Helper to split text into sentences and limit to 3 bubbles and 200 chars total
  const splitAndLimitBubbles = (text: string) => {
    const maxTotalChars = 200;
    const maxBubbles = 3;
    const ellipsis = '...';

    // 1. Truncate the entire text to maxTotalChars, adding ellipsis if needed.
    let effectiveText = text;
    if (effectiveText.length > maxTotalChars) {
      effectiveText = effectiveText.substring(0, maxTotalChars - ellipsis.length) + ellipsis;
    }

    // 2. Split the (potentially truncated) text into sentences.
    // This regex splits by common sentence endings (. ! ?) followed by a space or end of string.
    // It uses a positive lookbehind to keep the delimiter with the sentence.
    const rawSentences = effectiveText.split(/(?<=[.!?])\s*/).filter(s => s.trim() !== '');

    const finalBubbles: string[] = [];
    let currentTotalLength = 0;

    for (let i = 0; i < rawSentences.length && finalBubbles.length < maxBubbles; i++) {
      let sentence = rawSentences[i].trim();
      if (!sentence) continue;

      // If adding this sentence would exceed the total character limit, truncate it.
      if (currentTotalLength + sentence.length > maxTotalChars) {
        const remainingChars = maxTotalChars - currentTotalLength;
        if (remainingChars > ellipsis.length) {
          sentence = sentence.substring(0, remainingChars - ellipsis.length) + ellipsis;
        } else {
          // Not enough space for even ellipsis, so just break
          break;
        }
      }

      finalBubbles.push(sentence);
      currentTotalLength += sentence.length;
    }

    // Fallback: if no bubbles were created (e.g., empty text), return the effectiveText as one bubble.
    return finalBubbles.length > 0 ? finalBubbles : [effectiveText];
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-prosper-bg-page">
      <MobileScreen className="mt-4">
        <div className="flex flex-col h-full bg-white">
          {/* Top bar with back button and progress bar */}
          <div className="flex items-center p-4 border-b border-prosper-gray-light">
            <div className="flex-1 h-2 bg-prosper-gray-medium rounded-full">
              <div className="h-full w-2/3 bg-prosper-concept2-purple rounded-full"></div>
            </div>
          </div>

          {/* Conditional rendering for initial state vs. chat history */}
          {!hasUserSentMessage ? (
            // Initial state: Avatar, initial question, animated prompts
            <div className="flex-shrink-0 p-4 mt-4 flex flex-col items-center text-center">
              {/* Initial Avatar and Speech Bubble */}
              <div className="flex items-end justify-center mb-6 w-full">
                <div className="flex-shrink-0 flex items-center justify-center mr-4">
                  <Image
                    src="/peer-mentor-avatar.png"
                    alt="Friendly peer mentor"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
                <SpeechBubble className="max-w-[250px]" direction="left">
                  <p className="text-sm font-medium">
                    {initialAssistantMessageContent}
                  </p>
                </SpeechBubble>
              </div>

              {/* Animated Prompts */}
              <div className="flex items-center justify-center mb-6 min-h-[60px]">
                <div className={`px-4 pt-4 max-w-[80%] transition-opacity duration-500 ease-in-out ${showAnimatedPrompt ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-lg font-medium text-prosper-concept2-purple">
                    {animatedPrompts[currentAnimatedPromptIndex]}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Chat history state: All messages in a scrollable area
            <div className="flex-1 overflow-y-auto p-4 space-y-4 border-t border-prosper-gray-light">
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const isAssistantMessage = message.role === 'assistant';
                const messageText = message.parts?.find(part => part.type === 'text')?.text || '';

                if (isAssistantMessage) {
                  if (isLastMessage && status === 'streaming') {
                    // Render streaming message as a single bubble
                    return (
                      <div key={message.id} className="flex justify-start">
                        <div className="flex items-end justify-start w-full">
                          <div className="flex-shrink-0 flex items-center justify-center mr-4">
                            <Image
                              src="/peer-mentor-avatar.png"
                              alt="Friendly peer mentor"
                              width={96}
                              height={96}
                              className="object-contain"
                            />
                          </div>
                          <SpeechBubble direction="left" className="max-w-[70%]">
                            <p className="text-sm">{messageText}</p>
                          </SpeechBubble>
                        </div>
                      </div>
                    );
                  } else {
                    // Render completed assistant messages as multiple bubbles
                    const sentences = splitAndLimitBubbles(messageText);
                    return sentences.map((sentence, sIdx) => (
                      <div key={`${message.id}-${sIdx}`} className="flex justify-start">
                        <div className="flex items-end justify-start w-full">
                          <div className="flex-shrink-0 flex items-center justify-center mr-4">
                            <Image
                              src="/peer-mentor-avatar.png"
                              alt="Friendly peer mentor"
                              width={96}
                              height={96}
                              className="object-contain"
                            />
                          </div>
                          <SpeechBubble direction="left" className="max-w-[70%]">
                            <p className="text-sm">{sentence.trim()}</p>
                          </SpeechBubble>
                        </div>
                      </div>
                    ));
                  }
                } else {
                  // Render user messages as a single bubble
                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <SpeechBubble inverted direction="right" className="max-w-[70%]">
                        {message.parts.map((part, idx) =>
                          part.type === 'text' ? <span key={idx}>{part.text}</span> : null,
                        )}
                      </SpeechBubble>
                    </div>
                  );
                }
              })}

              {/* User's real-time speech-to-text bubble */}
              {/* Show interim transcript while recording, or final transcript while processing speech */}
              {(isRecording || (isProcessingSpeech && finalTranscript.trim())) && (
                <div className="flex justify-end">
                  <SpeechBubble inverted direction="right" className="max-w-[70%]">
                    <p className="text-sm">{isRecording ? interimTranscript : finalTranscript || "..."}</p>
                  </SpeechBubble>
                </div>
              )}

              {status === 'streaming' && (
                <div className="flex justify-start">
                  <div className="bg-prosper-bg-medium p-3 rounded-lg max-w-[70%]">
                    <Loader2 className="h-4 w-4 animate-spin text-prosper-gray-medium" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {speechError && (
            <div className="text-red-500 text-sm text-center mt-2">{speechError}</div>
          )}

          {/* Big Microphone Button - always visible */}
          <div className="flex-shrink-0 p-4 flex flex-col items-center text-center">
            <Button
              className="w-full max-w-xs h-20 bg-prosper-concept2-purple hover:bg-prosper-concept2-purple-dark text-white text-xl font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!recognition || isRecording || isProcessingSpeech || status === 'streaming' || status === 'submitted'}
            >
              {isRecording ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span>LISTENING...</span>
                </>
              ) : isProcessingSpeech ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span>PROCESSING SPEECH...</span>
                </>
              ) : status === 'submitted' || status === 'streaming' ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span>THINKING...</span>
                </>
              ) : (
                <>
                  <Mic className="h-8 w-8" />
                  <span>TAP TO SPEAK</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </MobileScreen>
    </div>
  );
}
