import './globals.css';
import ChatbotPanel from '@/components/ChatbotPanel';

export const metadata = {
  title: 'OZ Market Dashboard',
  description: 'Opportunity Zones Market Intelligence'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body className="flex min-h-screen">
        <div className="flex-grow overflow-y-auto">
          <header className="bg-brand-primary text-white py-3 px-6 shadow">
            <h1 className="text-2xl font-bold">Status of the OZ Market</h1>
          </header>
          <main className="p-6">{children}</main>
        </div>
        <ChatbotPanel/>
      </body>
    </html>
  );
} 