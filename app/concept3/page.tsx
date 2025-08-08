'use client';

import { MobileScreen } from '@/components/mobile-screen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, Loader2, PhoneCall, Send, Mic } from 'lucide-react';
import Image from 'next/image';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef, useCallback } from 'react';
import React from 'react';

export default function Concept3Page() {
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    body: {
      conceptId: 'concept3', // This is for the initial chat setup
    },
  });

  const [showCallScreen, setShowCallScreen] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialQuestionSentRef = useRef(false);
  const lastAssistantMessageIdRef = useRef<string | null>(null);

  const [input, setInput] = useState('');

  // Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Audio Loading State
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);

  // Format for Call Time (HH:MM:SS)
  const formatCallTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(unit => String(unit).padStart(2, '0'))
      .join(':');
  };

  // Format for Audio Time (MM:SS)
  const formatAudioTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return [minutes, seconds]
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

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      newRecognition.continuous = false; // Only capture one utterance at a time
      newRecognition.interimResults = true; // Get interim results
      newRecognition.lang = 'en-GB'; // Set language to match Maria's voice

      newRecognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
        setInterimTranscript('');
        setFinalTranscript('');
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
        setInput(final); // Update input field with final transcript
      };

      newRecognition.onend = () => {
        setIsRecording(false);
        // If a final transcript exists, automatically submit it
        if (finalTranscript.trim()) {
          handleSubmit(new Event('submit') as React.FormEvent<HTMLFormElement>);
        }
      };

      newRecognition.onerror = (event) => {
        setIsRecording(false);
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
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Effect to get user camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null; // Use a local variable for cleanup

    if (!showCallScreen) {
      const enableCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          currentStream = stream; // Assign to local variable for cleanup
          setUserStream(stream); // Update state
          console.log('Camera stream obtained:', stream);
        } catch (err) {
          console.error('Error accessing user camera:', err);
          // Optionally, show a message to the user that camera access was denied
        }
      };

      enableCamera();
    }

    // Cleanup function to stop camera stream when component unmounts or showCallScreen changes
    return () => {
      if (currentStream) { // Use the local variable for cleanup
        console.log('Stopping camera stream.');
        currentStream.getTracks().forEach(track => track.stop());
      }
      setUserStream(null); // Clear state
    };
  }, [showCallScreen]); // Re-run when showCallScreen changes

  // Effect to assign stream to video element and ensure it plays
  useEffect(() => {
    if (userVideoRef.current && userStream) {
      userVideoRef.current.srcObject = userStream;
      // Attempt to play the video, catching any errors (e.g., autoplay blocked)
      userVideoRef.current.play().catch(e => console.error("Error playing user video:", e));
      console.log('Assigned stream to video element and attempted play:', userStream);
    } else {
      console.log('Video ref or userStream not ready for assignment. Ref current:', userVideoRef.current, 'Stream:', userStream);
    }
  }, [userStream]); // Depend only on userStream state

  const startRecording = () => {
    if (recognition && !isRecording) {
      // Pause AI's audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        setIsSpeaking(false);
      }
      setInterimTranscript('');
      setFinalTranscript('');
      setInput(''); // Clear typed input before recording
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
  };

  const speakText = useCallback(async (text: string, messageId: string) => {
    if (!audioRef.current) {
      console.warn('[TTS] Audio ref is null, cannot speak.');
      return;
    }

    const currentAudioMessageId = lastAssistantMessageIdRef.current;
    const isNewMessage = currentAudioMessageId !== messageId;

    if (isNewMessage) {
      setIsLoadingAudio(true); // Start loading
      // Stop any currently playing audio and clear source
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = ''; // Explicitly clear the source
      setIsSpeaking(false); // Ensure it's false before attempting to play new audio
      setAudioProgress(0);

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            voiceName: 'en-GB-Chirp3-HD-Sulafat',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to fetch audio from TTS API:', response.statusText, errorData);
          return;
        }

        const data = await response.json();
        if (data.audioContent) {
          audioRef.current.src = `data:audio/mp3;base64,${data.audioContent}`;
          audioRef.current.load(); // Force the audio element to load the new source
          lastAssistantMessageIdRef.current = messageId; // Store the ID of the message whose audio is loaded
          audioRef.current.play().then(() => {
            setIsSpeaking(true); // Set to true only if play is successful
          }).catch(error => {
            console.error('Error attempting to play audio:', error);
            setIsSpeaking(false); // Ensure UI reflects non-playing state if play fails
          });
        } else {
          console.warn('[TTS] No audio content received from TTS API.');
        }
      } catch (error) {
        console.error('[TTS] Error synthesizing speech:', error);
      } finally {
        setIsLoadingAudio(false); // End loading
      }
    } else {
      // If it's the same message and audio is loaded, just toggle play/pause
      if (audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsSpeaking(true); // Set to true only if play is successful
        }).catch(error => {
          console.error('Error attempting to play existing audio:', error);
          setIsSpeaking(false);
        });
      } else {
        audioRef.current.pause();
        setIsSpeaking(false); // Explicitly set to false on pause
      }
    }
  }, []);

  const getLastAssistantMessage = useCallback(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        // Find the first part with type 'text'
        const textPart = messages[i].parts?.find(part => part.type === 'text');
        if (textPart && textPart.type === 'text') {
          return { message: messages[i], text: textPart.text };
        }
      }
    }
    return null;
  }, [messages]);

  const toggleSpeech = useCallback(() => {
    const assistantMessageInfo = getLastAssistantMessage();
    if (assistantMessageInfo) {
      speakText(assistantMessageInfo.text, assistantMessageInfo.message.id);
    } else {
      console.warn('[TTS] No valid assistant message found in history to play audio for.');
    }
  }, [getLastAssistantMessage, speakText]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsSpeaking(true);
    };
    const handlePause = () => {
      setIsSpeaking(false);
    };
    const handleEnded = () => {
      setIsSpeaking(false);
      setAudioProgress(100);
    };
    const handleTimeUpdate = () => {
      if (audio.duration) {
        const newProgress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(newProgress);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let messageToSend = input.trim();

    if (isRecording) {
      stopRecording(); // Stop recording if active
      messageToSend = finalTranscript.trim(); // Use final transcript if recording just ended
    }

    if (messageToSend) {
      const messageBody = { conceptId: 'concept3' };
      sendMessage({ text: messageToSend, body: messageBody });
      setInput('');
      setInterimTranscript(''); // Clear interim transcript after sending
      setFinalTranscript(''); // Clear final transcript after sending

      // Reset audio state when user sends a message
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsSpeaking(false);
        setAudioProgress(0);
        lastAssistantMessageIdRef.current = null;
      }
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
              <span className="text-sm font-medium text-prosper-text-dark">{formatCallTime(elapsedTime)}</span>
            </div>

            {/* User's self-view camera feed */}
            {userStream && (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted // Mute self-view to avoid echo
                className="absolute top-[35px] right-4 w-24 h-32 rounded-lg object-cover border-2 border-prosper-gray-medium transform scale-x-[-1] z-20"
              />
            )}

            <div className="relative flex-1 flex flex-col items-center justify-center bg-prosper-bg-medium text-white p-4">
              <Image
                src="/maria_720.png"
                alt="Professional virtual coach Maria"
                width={300}
                height={300}
                className="w-48 h-48 rounded-full object-cover border-4 border-prosper-gray-medium mb-6"
              />

              {/* Conditional rendering for assistant message and audio player */}
              {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && status !== 'streaming' && (
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
                          disabled={status === 'ready' && isLoadingAudio}
                        >
                          {isLoadingAudio ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : isSpeaking ? ( // Show Pause when isSpeaking is true
                            <Pause className="h-5 w-5" />
                          ) : ( // Show Play when isSpeaking is false
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                        <div className="flex-1 h-2 bg-prosper-concept3-blue-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                            style={{ width: `${audioProgress}%` }}
                          ></div>
                        </div>
                        {/* Display current time / duration if audio is loaded */}
                        <span className="text-xs">
                          {audioRef.current?.duration ? `${formatAudioTime(Math.floor(audioRef.current.currentTime))} / ${formatAudioTime(Math.floor(audioRef.current.duration))}` : '00:00 / 00:00'}
                        </span>
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
                value={isRecording ? interimTranscript : input}
                onChange={e => setInput(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Type your response..."}
                className="flex-1 bg-prosper-bg-medium text-prosper-text-dark border-prosper-gray-medium"
                disabled={status !== 'ready' && status !== 'streaming' || isRecording}
              />
              {input.trim() || finalTranscript.trim() ? (
                <Button type="submit" disabled={status !== 'ready' && status !== 'streaming'} className="bg-prosper-concept3-blue hover:bg-prosper-concept3-blue-dark text-white">
                  <Send className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={status !== 'ready' && status !== 'streaming' || !recognition}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-prosper-concept3-blue hover:bg-prosper-concept3-blue-dark'} text-white`}
                >
                  <Mic className="h-6 w-6" />
                </Button>
              )}
            </form>
            {speechError && (
              <div className="text-red-500 text-sm text-center mt-2">{speechError}</div>
            )}
            <audio ref={audioRef} className="hidden" />
          </div>
        )}
      </MobileScreen>
    </div>
  );
}
