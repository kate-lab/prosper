'use client'; // This is the client component

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar'; // Ensure this is a named import for 'Navbar'
import React from 'react'; // Explicitly import React

export default function LayoutClient({ // Ensure this is a default export
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/concept1', label: 'Concept 1' },
    { href: '/concept2', label: 'Concept 2' },
    { href: '/concept3', label: 'Concept 3' },
  ];

  return (
    <>
      <Navbar
        title="Prosper"
        links={navLinks} // Always pass all navigation links
      />
      <div className="flex-1 flex flex-col bg-prosper-bg-page"> {/* Updated background color */}
        {children}
      </div>
    </>
  );
}
