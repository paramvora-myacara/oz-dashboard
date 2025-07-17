// src/app/layout.js

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ResponsiveLayout from '@/components/ResponsiveLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'OZ Dashboard',
  description: 'Opportunity Zone Investment Dashboard',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white dark:bg-black antialiased">
        <AuthProvider>
          <ResponsiveLayout>{children}</ResponsiveLayout>
        </AuthProvider>
      </body>
    </html>
  );
}