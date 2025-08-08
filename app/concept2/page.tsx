'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MobileScreen } from '@/components/mobile-screen';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, Timer } from 'lucide-react'; // Import Timer icon
import Image from 'next/image';
import React from 'react';
import { SpeechBubble } from '@/components/speech-bubble';
import { DocumentCard } from '@/components/document-card'; // Import the new component
import ReactMarkdown from 'react-markdown';

export default function Concept2Page() {
  // Define the initial message content separately for immediate display
  const initialAssistantMessageContent = "Hi, here are some suggestions on what we can practice today. Should we start with practicing how to introduce yourself?";

  // State to track if the user has sent their first message (after the static greeting)
  const [isFirstUserMessageSent, setIsFirstUserMessageSent] = useState(false);
  // Ref to store the original content of the first user message for display
  const originalFirstUserInputRef = useRef<string | null>(null);

  // Initialize chat without initialMessages prop
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat?conceptId=concept2', // Pass conceptId as a query parameter
    }),
    // Removed body property from here, as conceptId is now in the URL
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const finalTranscriptRef = useRef(''); // Use a ref to ensure latest final transcript is available
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false); // New state for processing user's speech

  // State for the elevator pitch timer
  const [pitchTimer, setPitchTimer] = useState(0); // Current countdown value
  const [isPitchReady, setIsPitchReady] = useState(false); // New state: AI has prompted, waiting for user to start
  const [isPitchActive, setIsPitchActive] = useState(false); // Whether the pitch timer is running and recording
  const pitchTimerIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for the timer interval
  const [pitchPrompt, setPitchPrompt] = useState(''); // The prompt text for the pitch

  // Memoized handleSendMessage function - defined early
  const handleSendMessage = useCallback((text: string) => {
    let messageToSendToAI = text;

    // Check if this is the very first user message in the chat history
    // The initialMessages array starts with one assistant message (added by useEffect).
    // So, if messages.length is 1, it's the first user message.
    const isFirstUserMessage = messages.length === 1;

    // Only append if it's the very first user message AND not currently in a timed pitch
    if (isFirstUserMessage && !isPitchActive) {
      originalFirstUserInputRef.current = text; // Store original for display
      messageToSendToAI += ' i want to practice introducing myself'; // Append the specific phrase
      setIsFirstUserMessageSent(true); // Mark that the first user message has been sent
    }

    // Removed the explicit 'body' here, as conceptId is now passed via URL query parameter
    sendMessage({ text: messageToSendToAI });
    setFinalTranscript('');
    finalTranscriptRef.current = '';
  }, [sendMessage, messages.length, isPitchActive]); // Add isPitchActive to dependencies

  // Memoized startRecording and stopRecording functions - defined early
  const startRecording = useCallback(() => {
    if (recognition && !isRecording) {
      setInterimTranscript('');
      setFinalTranscript('');
      finalTranscriptRef.current = '';
      recognition.start();
      console.log('[Speech] Recognition started.');
    }
  }, [recognition, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognition && isRecording) {
      recognition.stop();
      console.log('[Speech] Recognition stopped.');
    }
  }, [recognition, isRecording]);

  // Dynamically add the initial assistant message on component mount
  useEffect(() => {
    // Only set initial message if messages array is empty (first render)
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: initialAssistantMessageContent,
        id: 'initial-peer-message',
        parts: [{ type: 'text', text: initialAssistantMessageContent }]
      }]);
    }
  }, [messages.length, setMessages, initialAssistantMessageContent]); // Depend on messages.length to ensure it runs only once

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
        setIsRecording(true);
        setSpeechError(null); // Clear any previous speech errors
        setInterimTranscript('');
        setFinalTranscript('');
        finalTranscriptRef.current = ''; // Clear ref on start
        setIsProcessingSpeech(false); // Ensure this is false when starting new recording
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
        setFinalTranscript(final); // Update state for UI
        finalTranscriptRef.current = final; // Update ref for onend
        // console.log(`[Speech] Interim: "${interim}", Final: "${final}"`); // Keep this for debugging if needed
      };

      newRecognition.onend = () => {
        console.log('[Speech] Recognition ended.');
        setIsRecording(false);
        // Use the ref for the most up-to-date final transcript
        if (finalTranscriptRef.current.trim()) {
          console.log('[Speech] Final transcript available, setting processing state.');
          setIsProcessingSpeech(true); // Set processing state before sending
          handleSendMessage(finalTranscriptRef.current.trim());
        } else {
          console.log('[Speech] No final transcript, returning to idle.');
          // If no speech was detected, ensure processing state is off
          setIsProcessingSpeech(false);
        }
      };

      newRecognition.onerror = (event) => {
        setIsRecording(false);
        setIsProcessingSpeech(false); // Stop processing state on error
        // Update the error message to be more user-friendly
        setSpeechError("I didn't catch that, try again!");
        setInterimTranscript(''); // Clear interim transcript on error
        setFinalTranscript('');   // Clear final transcript on error
        finalTranscriptRef.current = ''; // Clear ref on error
        console.error('[Speech] Recognition error:', event.error);
        console.log('[Speech] Button should now be re-enabled for retry.'); // Add this log
      };

      setRecognition(newRecognition);
    } else {
      setSpeechError('Speech Recognition not supported in this browser.');
      console.warn('[Speech] Speech Recognition not supported.');
    }

    return () => {
      // Use the 'recognition' state variable for cleanup, as 'newRecognition' is out of scope
      if (recognition) {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
      }
    };
  }, [handleSendMessage]); // Removed 'recognition' from dependencies

  // Effect to clear speechError after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (speechError) {
      timer = setTimeout(() => {
        setSpeechError(null);
      }, 5000); // Clear error after 5 seconds
    }
    return () => clearTimeout(timer);
  }, [speechError]);

  // Reset isProcessingSpeech when AI starts streaming or is ready again
  useEffect(() => {
    if (status === 'streaming' || status === 'ready') {
      setIsProcessingSpeech(false);
    }
  }, [status]);

  // Effect to handle tool results and set pitch ready state
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'tool') {
      const toolResultPart = lastMessage.parts?.find(
        (part) => part.type === 'tool_result' && part.toolResult.type === 'start_elevator_pitch_timer'
      );

      if (toolResultPart && toolResultPart.type === 'tool_result') {
        console.log('[Client] Received start_elevator_pitch_timer tool result:', toolResultPart.toolResult); // Log client-side receipt
        const { duration, prompt } = toolResultPart.toolResult;
        setPitchTimer(duration);
        setPitchPrompt(prompt);
        setIsPitchReady(true); // Set pitch ready, but not active yet
        setIsPitchActive(false); // Ensure it's not active yet
        stopRecording(); // Stop any general recording if active
      }
    }
  }, [messages, stopRecording]); // Depend on messages array to detect new tool results and stopRecording

  // Effect for the countdown timer
  useEffect(() => {
    if (isPitchActive && pitchTimer > 0) {
      pitchTimerIntervalRef.current = setInterval(() => {
        setPitchTimer((prev) => {
          if (prev <= 1) { // Stop at 0
            clearInterval(pitchTimerIntervalRef.current!);
            setIsPitchActive(false); // Pitch is no longer active
            setIsPitchReady(false); // Reset ready state too
            stopRecording(); // Stop recording when timer hits 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (pitchTimer === 0 && isPitchActive) { // Fallback if timer hits 0 while still active
      setIsPitchActive(false);
      setIsPitchReady(false); // Reset ready state too
      stopRecording();
    }

    return () => {
      if (pitchTimerIntervalRef.current) {
        clearInterval(pitchTimerIntervalRef.current);
      }
    };
  }, [isPitchActive, pitchTimer, stopRecording]); // Dependencies for the timer itself and stopRecording

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, finalTranscript, isProcessingSpeech]); // Scroll when messages or transcripts change

  // Helper to format assistant messages for display (SpeechBubble or DocumentCard)
  const formatAssistantMessageForDisplay = (text: string) => {
    const minCharsForDocument = 250;
    const minNewlinesForDocument = 2;
    const maxBubbles = 4; // Increased max bubbles for conversational replies
    const maxCharsPerBubble = 300; // Increased max chars per bubble
    const ellipsis = '...';

    const newlineCount = (text.match(/\n/g) || []).length;

    // Heuristic: If text is long AND has multiple newlines, treat as a document
    if (text.length > minCharsForDocument && newlineCount >= minNewlinesForDocument) {
      return { type: 'document', content: text };
    } else {
      // Otherwise, split into paragraphs for speech bubbles
      const paragraphs = text.split(/\n\s*\n|\n/).filter(p => p.trim() !== ''); // Split by paragraph or single newline

      const bubbles: string[] = [];
      for (let i = 0; i < paragraphs.length && bubbles.length < maxBubbles; i++) {
        let paragraph = paragraphs[i].trim();
        if (!paragraph) continue;

        if (paragraph.length > maxCharsPerBubble) {
          paragraph = paragraph.substring(0, maxCharsPerBubble - ellipsis.length) + ellipsis;
        }
        bubbles.push(paragraph);
      }
      return { type: 'bubbles', content: bubbles };
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-prosper-bg-page">
      <MobileScreen className="mt-4">
        <div className="flex flex-col h-full bg-white">

          {/* Conditional rendering for initial state vs. chat history */}
          {!hasUserSentMessage ? (
            // Initial state: Avatar, initial question, animated prompts
            <div className="flex-shrink-0 p-4 mt-4 flex flex-col items-center">
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
                <SpeechBubble className="max-w-[250px] space-y-2 text-left" direction="left">
                  <p className="text-sm font-medium">
                    Hi, here are some suggestions on what we can practice today.
                  </p>
                  <p className="text-sm font-medium">
                    Should we start with practicing how to introduce yourself?
                  </p>
                </SpeechBubble>
              </div>
            </div>
          ) : (
            // Chat history state: All messages in a scrollable area
            <div className="flex-1 overflow-y-auto p-4 space-y-4 border-t border-prosper-gray-light">
              {messages.map((message, index) => {
                const previousMessage = messages[index - 1];
                const isAssistantMessage = message.role === 'assistant';
                const isUserMessage = message.role === 'user';
                const isToolMessage = message.role === 'tool'; // New role for tool messages

                // Determine if avatar should be shown for this message
                // Avatar should NOT be shown for DocumentCard
                let shouldShowAvatar = (isAssistantMessage || isToolMessage) && (!previousMessage || (previousMessage.role !== 'assistant' && previousMessage.role !== 'tool'));

                // Extract text content
                const messageText = message.parts?.find(part => part.type === 'text')?.text || '';

                // Check for tool result part within the message
                const toolResultPart = isToolMessage
                  ? message.parts?.find(
                      (part) => part.type === 'tool_result' && part.toolResult.type === 'start_elevator_pitch_timer'
                    )
                  : undefined;

                if (toolResultPart && toolResultPart.type === 'tool_result') {
                  const { prompt } = toolResultPart.toolResult;
                  return (
                    <div key={message.id} className="flex justify-start">
                      <div className="flex items-end justify-start w-full">
                        {shouldShowAvatar && (
                          <div className="flex-shrink-0 flex items-center justify-center mr-4">
                            <Image
                              src="/peer-mentor-avatar.png"
                              alt="Friendly peer mentor"
                              width={96}
                              height={96}
                              className="object-contain"
                            />
                          </div>
                        )}
                        {/* Placeholder for alignment if avatar is not shown */}
                        {!shouldShowAvatar && (
                          <div className="w-24 mr-4" /> // Adjust width to match avatar + margin
                        )}
                        <SpeechBubble direction="left" className="max-w-[70%]">
                          <p className="text-sm font-medium">{prompt}</p>
                        </SpeechBubble>
                      </div>
                    </div>
                  );
                } else if (isAssistantMessage) {
                  // Check if this is the special emoji message after a tool call
                  const isPostPitchEmojiMessage = previousMessage && previousMessage.role === 'tool' && messageText.trim().match(/^(🎉|✨|🥳)$/);

                  if (isPostPitchEmojiMessage) {
                    return (
                      <div key={message.id} className="flex justify-start">
                        <div className="flex items-end justify-start w-full">
                          {shouldShowAvatar && (
                            <div className="flex-shrink-0 flex items-center justify-center mr-4">
                              <Image
                                src="/peer-mentor-avatar.png"
                                alt="Friendly peer mentor"
                                width={96}
                                height={96}
                                className="object-contain"
                              />
                            </div>
                          )}
                          {!shouldShowAvatar && (
                            <div className="w-24 mr-4" />
                          )}
                          {/* Render only the emoji in the bubble's place */}
                          <div className="flex items-center justify-center w-20 h-20 text-5xl rounded-full bg-prosper-concept2-purple shadow-md">
                            {isPostPitchEmojiMessage[1]} {/* The captured emoji */}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Regular assistant message rendering
                    const displayContent = formatAssistantMessageForDisplay(messageText);

                    if (displayContent.type === 'document') {
                      // If it's a document, explicitly set shouldShowAvatar to false for this message
                      shouldShowAvatar = false;
                      return (
                        <div key={message.id} className="flex justify-start w-full">
                          <div className="flex items-end justify-start w-full">
                            {/* No avatar for document cards, so no spacer needed */}
                            <DocumentCard className="flex-1">
                              <ReactMarkdown>{displayContent.content}</ReactMarkdown>
                            </DocumentCard>
                          </div>
                        </div>
                      );
                    } else {
                      return displayContent.content.map((sentence, sIdx) => (
                        <div key={`${message.id}-${sIdx}`} className="flex justify-start">
                          <div className="flex items-end justify-start w-full">
                            {shouldShowAvatar && sIdx === 0 && (
                              <div className="flex-shrink-0 flex items-center justify-center mr-4">
                                <Image
                                  src="/peer-mentor-avatar.png"
                                  alt="Friendly peer mentor"
                                  width={96}
                                  height={96}
                                  className="object-contain"
                                />
                              </div>
                            )}
                            {!shouldShowAvatar && sIdx === 0 && (
                              <div className="w-24 mr-4" />
                            )}
                            <SpeechBubble direction="left" className="max-w-[70%]">
                              <ReactMarkdown className="text-sm text-left">{sentence.trim()}</ReactMarkdown>
                            </SpeechBubble>
                          </div>
                        </div>
                      ));
                    }
                  }
                } else if (isUserMessage) {
                  // Existing user message rendering
                  // The first user message will be at index 1 because the initial assistant message is at index 0.
                  const isFirstUserMessageInChat = message.role === 'user' && index === 1 && isFirstUserMessageSent;

                  // Determine the text to display for the message
                  const displayedText = isFirstUserMessageInChat && originalFirstUserInputRef.current
                    ? originalFirstUserInputRef.current
                    : message.parts.find(part => part.type === 'text')?.text || '';

                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <SpeechBubble inverted direction="right" className="max-w-[70%] text-left">
                        <ReactMarkdown>{displayedText}</ReactMarkdown>
                      </SpeechBubble>
                    </div>
                  );
                }
                return null; // Fallback for unhandled message types
              })}

              {/* User's real-time speech-to-text bubble */}
              {(isRecording || (isProcessingSpeech && finalTranscript.trim())) && (
                <div className="flex justify-end">
                  <SpeechBubble inverted direction="right" className="max-w-[70%]">
                    <p className="text-sm">{isRecording ? interimTranscript : finalTranscript || "..."}</p>
                  </SpeechBubble>
                </div>
              )}

              {/* AI Thinking/Streaming Loader - now only appears when AI is actively streaming */}
              {status === 'streaming' && (
                <div className="flex justify-start">
                  <div className="flex items-end justify-start w-full">
                    {/* Placeholder for avatar alignment */}
                    <div className="w-24 mr-4" />
                    <div className="bg-prosper-bg-medium p-3 rounded-lg max-w-[70%]">
                      <Loader2 className="h-4 w-4 animate-spin text-prosper-gray-medium" />
                    </div>
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
              className={`w-full max-w-xs h-20 text-white text-xl font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2
                ${isPitchActive ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-prosper-concept2-purple hover:bg-prosper-concept2-purple-dark'}
              `}
              onClick={() => {
                if (isPitchReady && !isPitchActive) {
                  // User is ready to start the pitch after AI prompt.
                  // This is the transition from "ready" to "active".
                  setIsPitchReady(false); // No longer just "ready", now "active"
                  setIsPitchActive(true); // Start the pitch timer logic
                  startRecording(); // Start speech recognition
                } else if (isRecording) {
                  // User is currently recording (either general or pitch) and wants to stop.
                  stopRecording();
                  if (isPitchActive) { // If it was a pitch, reset pitch states
                    setIsPitchActive(false);
                    setPitchTimer(0);
                    if (pitchTimerIntervalRef.current) {
                      clearInterval(pitchTimerIntervalRef.current);
                    }
                  }
                } else {
                  // Default state, not recording, not in pitch-ready state. User wants to start general recording.
                  startRecording();
                }
              }}
              disabled={
                !recognition || // Speech recognition not supported
                isProcessingSpeech || // Currently processing user's speech
                status === 'streaming' || // AI is streaming a response
                status === 'submitted' // AI is processing a request (submitted but not streaming yet)
              }
            >
              {isPitchReady ? (
                <>
                  <Timer className="h-8 w-8" /> {/* Timer icon */}
                  <span>START YOUR ELEVATOR PITCH</span>
                </>
              ) : isPitchActive ? (
                <>
                  <Mic className="h-8 w-8" />
                  <span>{pitchTimer > 0 ? `PITCH: ${pitchTimer}s` : 'TIME UP!'}</span>
                </>
              ) : isRecording ? (
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
