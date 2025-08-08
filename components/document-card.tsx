import React from 'react';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  children: React.ReactNode;
  className?: string;
}

export function DocumentCard({ children, className }: DocumentCardProps) {
  return (
    <div
      className={cn(
        "relative bg-white p-6 rounded-lg shadow-lg border border-prosper-gray-light text-prosper-text-dark w-full", // Changed to w-full
        "before:content-[''] before:absolute before:inset-0 before:rounded-lg before:bg-prosper-bg-medium before:z-[-1] before:translate-x-1 before:translate-y-1", // Simple shadow effect
        className
      )}
    >
      <div className="prose prose-sm max-w-none"> {/* Use prose for basic markdown styling */}
        {children}
      </div>
    </div>
  );
}
