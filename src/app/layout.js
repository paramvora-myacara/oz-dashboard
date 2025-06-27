// src/app/layout.js

import './globals.css';
import ChatbotPanel from '@/components/ChatbotPanel';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';

export const metadata = {
  title: 'OZ Market Intelligence - Real-time Analytics',
  description: 'Opportunity Zone investment analytics and market intelligence platform'
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
        <div className="flex min-h-screen">
          {/* Main Content */}
          <div className="flex-1 mr-80 lg:mr-96 overflow-hidden">
            <header className="absolute top-0 left-0 z-50 p-8">
              <Image 
                src="/ozlistings-logo.png" 
                alt="OZ Listings" 
                width={120} 
                height={40} 
                className="h-6 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                priority
                quality={100}
              />
            </header>
            <main>{children}</main>
          </div>
          
          {/* Theme Toggle - Positioned to the left of chatbot, aligned with Ozzie icon */}
          <div className="fixed right-80 lg:right-96 top-6 z-50 pr-6">
            <ThemeToggle />
          </div>
          
          {/* Fixed Chatbot */}
          <div className="fixed right-0 top-0 h-screen w-80 lg:w-96 z-40">
            <ChatbotPanel />
          </div>
        </div>
      </body>
    </html>
  );
}