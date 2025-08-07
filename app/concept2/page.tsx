'use client';

import { MobileScreen } from '@/components/mobile-screen';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import Image from 'next/image';
import React from 'react'; // Explicitly import React

export default function Concept2Page() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-prosper-bg-page"> {/* Updated background color */}
      <MobileScreen className="mt-4">
        <div className="flex flex-col h-full bg-white"> {/* This is the inner app interface background */}
          {/* Top bar with back button and progress bar */}
          <div className="flex items-center p-4 border-b border-prosper-gray-light">
            <div className="flex-1 h-2 bg-prosper-gray-medium rounded-full">
              <div className="h-full w-2/3 bg-prosper-concept2-purple rounded-full"></div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            {/* Silhouette character */}
            <div className="w-32 h-32 rounded-full bg-prosper-gray-medium flex items-center justify-center mb-6">
              <Image
                src="/placeholder.svg"
                alt="Human silhouette"
                width={128}
                height={128}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Speech bubble */}
            <div className="bg-prosper-bg-medium p-4 rounded-lg shadow-md mb-8 max-w-[80%]">
              <p className="text-lg font-medium text-prosper-concept2-purple">
                Tell me a bit about yourself...
              </p>
            </div>

            {/* Tap to Speak button */}
            <Button className="w-full max-w-xs h-20 bg-prosper-concept2-purple hover:bg-prosper-concept2-purple-dark text-white text-xl font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2">
              <Mic className="h-8 w-8" />
              <span>TAP TO SPEAK</span>
            </Button>
          </div>
        </div>
      </MobileScreen>
    </div>
  );
}
