// src/app/layout.js

import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import ThemeLogo from '@/components/ThemeLogo';
import ThemeToggle from '@/components/ThemeToggle';
import ChatbotPanel from '@/components/ChatbotPanel';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'OZ Dashboard',
  description: 'Opportunity Zone Investment Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-white dark:bg-black antialiased">
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* Main Content */}
            <div className="flex-1 mr-[35%] lg:mr-[25%] px-2 sm:px-3 lg:px-0 overflow-y-auto scroll-container">
              <header className="absolute top-0 left-0 z-50 p-[2%]">
                <ThemeLogo />
              </header>
              <main>{children}</main>
            </div>
            
            {/* Theme Toggle - Positioned to the left of chatbot, aligned with Ozzie icon */}
            <div className="fixed right-[35%] lg:right-[25%] top-[2%] z-50 pr-[1.5%]">
              <ThemeToggle />
            </div>
            
            {/* Fixed Chatbot - Toggle between 35% and 25% */}
            <div className="fixed right-0 top-0 h-screen w-[35%] lg:w-[25%] z-40">
              <Suspense fallback={
                <div className="h-full glass-card flex flex-col bg-black/80 dark:bg-black/80 backdrop-blur-2xl border-l border-black/10 dark:border-white/10">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mb-4 mx-auto"></div>
                      <p className="text-white/60 text-sm">Loading chat...</p>
                    </div>
                  </div>
                </div>
              }>
                <ChatbotPanel />
              </Suspense>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}