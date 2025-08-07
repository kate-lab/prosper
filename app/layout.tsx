import './globals.css';
import { Inconsolata, Roboto, Albert_Sans as Libertinus_Sans } from 'next/font/google'; // Import Inconsolata, Roboto, and Libertinus_Sans
import LayoutClient from '@/app/layout-client'; // Changed to absolute import path

const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-inconsolata', // Define as CSS variable
});

const robotoHeadline = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'], // Specify weights if needed for headings
  variable: '--font-roboto-headline', // Define as CSS variable
});

const libertinusSans = Libertinus_Sans({
  subsets: ['latin'],
  weight: ['400', '700'], // Assuming you want regular and bold weights
  variable: '--font-libertinus-sans', // Define as CSS variable
});

export const metadata = {
  title: 'Prosper Chatbot Concepts',
  description: 'Testing different AI chatbot propositions for job interview coaching.',
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inconsolata.variable} ${robotoHeadline.variable} ${libertinusSans.variable}`}>
      <body className={`font-inconsolata flex flex-col min-h-screen`}>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
