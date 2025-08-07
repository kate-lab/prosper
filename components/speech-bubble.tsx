import React from 'react';
import { cn } from '@/lib/utils';

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right'; // Tail direction
  inverted?: boolean; // Inverted colors (purple bg, white text)
}

export function SpeechBubble({ children, className, direction = 'left', inverted = false }: SpeechBubbleProps) {
  const bubbleClasses = cn(
    "relative rounded-xl p-4 shadow-md flex-grow min-h-[80px]",
    inverted
      ? "bg-prosper-concept2-purple text-white border-prosper-concept2-purple"
      : "bg-white text-prosper-text-dark border-2 border-prosper-concept2-purple", // Added border-2 here
    className
  );

  // Tail border (always prosper-concept2-purple)
  const tailBorderClasses = cn(
    "absolute w-0 h-0",
    direction === 'left' ?
      "bottom-[20px] left-[-10px] border-t-[10px] border-b-[10px] border-r-[10px] border-t-transparent border-b-transparent border-r-prosper-concept2-purple" :
      "bottom-[20px] right-[-10px] border-t-[10px] border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent border-l-prosper-concept2-purple"
  );

  // Tail inner fill (matches bubble background)
  const tailFillClasses = cn(
    "absolute w-0 h-0",
    direction === 'left' ?
      cn(
        "bottom-[20px] left-[-8px] border-t-[10px] border-b-[10px] border-r-[10px] border-t-transparent border-b-transparent",
        inverted ? "border-r-prosper-concept2-purple" : "border-r-white"
      ) :
      cn(
        "bottom-[20px] right-[-8px] border-t-[10px] border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent",
        inverted ? "border-l-prosper-concept2-purple" : "border-l-white"
      )
  );

  return (
    <div className={bubbleClasses}>
      {children}
      {/* Speech bubble tail (border) */}
      <div className={tailBorderClasses}></div>
      {/* Speech bubble tail (inner fill) */}
      <div className={tailFillClasses}></div>
    </div>
  );
}
