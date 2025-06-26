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
      <body className="bg-gray-900 overflow-x-hidden">
        <div className="flex min-h-screen">
          {/* Main Content */}
          <div className="flex-1 mr-80 lg:mr-96">
            <header className="fixed top-0 left-0 right-80 lg:right-96 z-50 bg-black/20 backdrop-blur-md border-b border-gray-800">
              <div className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <Image src="/ozlistings-logo.png" alt="OZ Listings" width={32} height={32} className="h-8 w-auto"/>
                  <div className="h-6 w-px bg-gray-700"></div>
                  <span className="text-sm text-gray-400">Market Analytics Dashboard</span>
                </div>
              </div>
            </header>
            <main className="pt-16">{children}</main>
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