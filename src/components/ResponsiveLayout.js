'use client';

import { Suspense, useState, useEffect, useRef, useLayoutEffect } from 'react';
import ChatbotPanel from '@/components/ChatbotPanel';
import ThemeLogo from '@/components/ThemeLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { Menu, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';

export default function ResponsiveLayout({ children }) {
  // Track viewport to toggle between mobile / desktop layout
  const [isMobile, setIsMobile] = useState(false);
  // Show / hide mobile specific panels
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // --------------------------
  // Dynamic bottom padding
  // --------------------------
  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(0);

  // Measure nav height (incl. safe-area) on mount & resize
  useLayoutEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ----------------------
  // Mobile Layout
  // ----------------------
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between p-4">
            <ThemeLogo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setShowMobileChat((prev) => !prev)}
                className="p-2 glass-card rounded-xl text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all bg-white/80 dark:bg-black/20 backdrop-blur-2xl border border-black/10 dark:border-white/10"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowMobileMenu((prev) => !prev)}
                className="p-2 glass-card rounded-xl text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all bg-white/80 dark:bg-black/20 backdrop-blur-2xl border border-black/10 dark:border-white/10"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main content with top padding for fixed header and dynamic bottom padding for nav & device safe-area */}
        <main
          className="flex-1 pt-16 overflow-y-auto scroll-container"
          /* Reserve exactly the height of the bottom navigation (incl. safe-area) */
          style={{ paddingBottom: navHeight }}
        >
          {children}
        </main>

        {/* Slide-in Mobile Menu */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-40 pt-16">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="absolute right-0 top-16 w-64 h-full bg-white dark:bg-black border-l border-black/10 dark:border-white/10 p-6">
              <nav className="space-y-4">
                <Link href="#map" className="block py-2 text-black dark:text-white">OZ Map</Link>
                <Link href="#investment-reasons" className="block py-2 text-black dark:text-white">Why Invest</Link>
                <Link href="#overview" className="block py-2 text-black dark:text-white">Market Overview</Link>
                <hr className="border-black/10 dark:border-white/10" />
                <Link href="/check-oz" className="block py-2 text-black dark:text-white">Check OZ Status</Link>
                <Link href="/check-investor-eligibility" className="block py-2 text-black dark:text-white">Check Eligibility</Link>
                <Link href="/tax-calculator" className="block py-2 text-black dark:text-white">Tax Calculator</Link>
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Chatbot – slides up from bottom */}
        <div
          className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ${
            showMobileChat ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="h-[80vh] bg-white dark:bg-gradient-to-br dark:from-blue-950/60 dark:via-blue-950/35 dark:to-black/90 border-t border-black/10 dark:border-white/10 rounded-t-3xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
              <h3 className="font-semibold text-black dark:text-white">Chat with Ozzie</h3>
              <button
                onClick={() => setShowMobileChat(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-black/60 dark:text-white/60" />
              </button>
            </div>
            <div className="h-[calc(80vh-64px)]">
              <Suspense fallback={<div className="p-4 text-center">Loading chat...</div>}>
                <ChatbotPanel isMobile={true} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav
          ref={navRef}
          className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-black/10 dark:border-white/10 z-40"
          /* Keep nav buttons above device safe-area */
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="grid grid-cols-4 gap-1 p-2">
            <Link
              href="/"
              className="flex flex-col items-center py-2 text-xs text-black/60 dark:text-white/60"
            >
              {/* Home icon */}
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </Link>
            <Link
              href="/check-oz"
              className="flex flex-col items-center py-2 text-xs text-black/60 dark:text-white/60"
            >
              {/* MapPin icon */}
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Check OZ
            </Link>
            <Link
              href="/tax-calculator"
              className="flex flex-col items-center py-2 text-xs text-black/60 dark:text-white/60"
            >
              {/* Calculator icon */}
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Calculator
            </Link>
            <Link
              href="/check-investor-eligibility"
              className="flex flex-col items-center py-2 text-xs text-black/60 dark:text-white/60"
            >
              {/* CheckCircle icon */}
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Qualify
            </Link>
          </div>
        </nav>
      </div>
    );
  }

  // ----------------------
  // Desktop Layout – mirrors previous implementation
  // ----------------------
  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 mr-[35%] lg:mr-[25%] px-2 sm:px-3 lg:px-0 overflow-y-auto scroll-container">
        <header className="absolute top-0 left-0 z-50 p-[2%]">
          <ThemeLogo />
        </header>
        <main>{children}</main>
      </div>

      {/* Theme Toggle */}
      <div className="fixed right-[35%] lg:right-[25%] top-[2%] z-50 pr-[1.5%]">
        <ThemeToggle />
      </div>

      {/* Fixed Chatbot */}
      <div className="fixed right-0 top-0 h-screen w-[35%] lg:w-[25%] z-40">
        <Suspense
          fallback={
            <div className="h-full glass-card flex flex-col bg-white dark:bg-gradient-to-br dark:from-blue-950/60 dark:via-blue-950/35 dark:to-black/90 backdrop-blur-2xl border-l border-black/10 dark:border-white/10">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mb-4 mx-auto"></div>
                  <p className="text-white/60 text-sm">Loading chat...</p>
                </div>
              </div>
            </div>
          }
        >
          <ChatbotPanel />
        </Suspense>
      </div>
    </div>
  );
} 