import React from 'react';

interface MobileScreenProps {
children: React.ReactNode;
className?: string;
}

export function MobileScreen({ children, className }: MobileScreenProps) {
return (
  <div className={`relative w-full max-w-sm h-[700px] bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-prosper-gray-dark flex flex-col ${className}`}>
    {/* Top notch/speaker simulation */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-prosper-gray-dark rounded-b-lg z-10"></div>
    {/* Screen content */}
    <div className="flex-1 overflow-hidden relative font-sans">
      {children}
    </div>
  </div>
);
}
