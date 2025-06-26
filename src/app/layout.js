// src/app/layout.js

import './globals.css';
import ChatbotPanel from '@/components/ChatbotPanel';
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
      <body className="bg-gray-900">
        <div className="flex min-h-screen">
          {/* Main Content */}
          <div className="flex-1 mr-80 lg:mr-96 overflow-hidden">
            <header className="absolute top-0 left-0 z-50">
              <div className="p-4">
                <Image 
                  src="/ozlistings-logo.png" 
                  alt="OZ Listings" 
                  width={60} 
                  height={20} 
                  className="h-5 w-auto object-contain opacity-90"
                  priority
                  quality={100}
                />
              </div>
            </header>
            <main className="pt-8">{children}</main>
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