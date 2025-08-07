import React from 'react';
import Image from 'next/image'; // Import Image component

interface NavbarProps {
  title: string; // Still keep title prop for potential fallback or other uses
  links?: { href: string; label: string }[];
}

export function Navbar({ title, links }: NavbarProps) {
  return (
    <nav className="w-full bg-prosper-navbar-bg shadow-sm py-4 px-6 flex items-center justify-between">
      <a href="/" className="cursor-pointer">
        <Image
          src="/prosper-logo.svg"
          alt="Prosper Logo"
          width={100} // Adjust width as needed
          height={30} // Adjust height as needed
          className="h-auto" // Maintain aspect ratio
        />
      </a>
      {links && (
        <div className="flex space-x-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-prosper-text-dark hover:bg-prosper-gray-light px-4 py-2"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
