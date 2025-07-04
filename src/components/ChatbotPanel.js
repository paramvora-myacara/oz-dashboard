// src/components/ChatbotPanel.js

// Enhanced ChatbotPanel.js with unified design

'use client';
import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useChatStore } from '@/stores/chatStore';
import AuthOverlay from './AuthOverlay';

export default function ChatbotPanel() {
  const { user, loading, signOut } = useAuth();
  const {
    getCurrentConversation,
    getCurrentMessageCount,
    addMessage,
    incrementMessageCount,
    setCurrentUser,
    copyGuestToUser
  } = useChatStore();
  
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [highlightedQuestions, setHighlightedQuestions] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // Handle hydration to prevent SSR/client mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Animate preset questions with breathing highlights
  useEffect(() => {
    const animateQuestions = () => {
      const totalQuestions = presetQuestions.length;
      const numHighlighted = 1; // Number of questions to highlight at once
      
      // Create a wave effect by highlighting different questions
      const startIndex = Math.floor(Math.random() * totalQuestions);
      const highlighted = new Set();
      
      for (let i = 0; i < numHighlighted; i++) {
        highlighted.add((startIndex + i) % totalQuestions);
      }
      
      setHighlightedQuestions(highlighted);
    };

    // Initial animation
    animateQuestions();
    
    // Continue animating every 3 seconds
    const interval = setInterval(animateQuestions, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get current conversation and message count from store
  const currentConversation = getCurrentConversation();
  const msgs = isHydrated ? currentConversation.messages : [];
  const messageCount = getCurrentMessageCount();
  
  const presetQuestions = [
    "What are OZs?",
    "What are QOFs?",
    "Tax benefits explained",
    "Best performing states",
    "How to invest in OZs",
    "2025 market outlook"
  ];
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [msgs]);

  // Handle user auth state changes
  useEffect(() => {
    if (user) {
      const state = useChatStore.getState();
      const userHasConversation = state.conversations[user.id];
      
      // If user doesn't have a conversation yet, copy from guest
      if (!userHasConversation) {
        copyGuestToUser(user.id);
        
        // Close auth overlay if it's open
        if (showAuthOverlay) {
          setShowAuthOverlay(false);
        }
        
        // If there was a pending question, answer it now
        if (pendingQuestion) {
          setTimeout(() => {
            generateBotResponse(pendingQuestion);
            setPendingQuestion(null);
          }, 500);
        }
      } else {
        // Just switch to user's existing conversation
        setCurrentUser(user.id);
        
        // Close auth overlay if it's open
        if (showAuthOverlay) {
          setShowAuthOverlay(false);
        }
      }
    } else {
      // User signed out - switch back to guest
      setCurrentUser('guest');
    }
  }, [user, showAuthOverlay, pendingQuestion, copyGuestToUser, setCurrentUser]);

  const handlePresetClick = (question) => {
    handleSend(null, question);
  };

  const generateBotResponse = (messageText) => {
    setTimeout(() => {
      let response = "";
      const query = messageText.toLowerCase();
      
      if (query.includes('what are ozs') || query.includes('what are opportunity zones')) {
        response = "Opportunity Zones (OZs) are economically distressed communities designated by states and certified by the U.S. Treasury. Created by the 2017 Tax Cuts and Jobs Act, they offer significant tax incentives to investors who deploy capital gains into these areas through Qualified Opportunity Funds (QOFs). The goal is to spur economic development and job creation in underserved communities.";
      } else if (query.includes('what are qofs') || query.includes('qualified opportunity fund')) {
        response = "Qualified Opportunity Funds (QOFs) are investment vehicles organized as corporations or partnerships for investing in eligible property located in Opportunity Zones. To qualify, a fund must hold at least 90% of its assets in OZ property. QOFs can invest in real estate, operating businesses, or infrastructure projects within designated zones.";
      } else if (query.includes('tax benefit') || query.includes('tax incentive')) {
        response = "OZ investments offer three major tax benefits: 1) Temporary deferral of capital gains tax until December 31, 2026, 2) Step-up in basis of 10% if investment held for 5 years, 15% for 7 years, and 3) Permanent exclusion from capital gains tax on appreciation of OZ investment if held for 10+ years. This can result in significant tax savings!";
      } else if (query.includes('best performing') || query.includes('top state')) {
        response = "Top performing OZ markets by investment volume and ROI: 1) California ($18.2B, 879 zones), 2) Texas ($14.5B, 628 zones), 3) Florida ($12.3B, 427 zones), 4) New York ($11.8B, 514 zones), 5) Georgia ($9.2B, 260 zones). Miami, Austin, and Phoenix show the highest ROI at 32%, 28%, and 27% respectively.";
      } else if (query.includes('how to invest') || query.includes('get started')) {
        response = "To invest in OZs: 1) Realize a capital gain from any source, 2) Invest that gain in a QOF within 180 days, 3) Choose between investing in an existing QOF or creating your own, 4) Hold for at least 10 years for maximum tax benefits. Most investors start with $100K+ minimum. Consider diversifying across multiple zones and sectors for optimal risk-adjusted returns.";
      } else if (query.includes('2025') || query.includes('outlook') || query.includes('forecast')) {
        response = "2025 OZ market outlook is strong: Expected $15-20B in new investments, focus shifting to climate-resilient developments and workforce housing. Key trends include tech hub developments in secondary cities, increased institutional participation, and potential legislative extensions. Best opportunities in Southeast and Southwest markets with population growth.";
      } else {
        response = `Great question about "${messageText.slice(0,50)}..." Based on current market data, OZ investments are showing strong momentum with average returns of 23.7%. The key is finding the right balance between impact and returns. Would you like me to dive deeper into any specific aspect?`;
      }
      
      const botMsg = { text: response, sender: 'bot' };
      addMessage(botMsg);
    }, 800);
  };

  const handleSend = (e, presetQuestion = null) => {
    if (e) e.preventDefault();
    const messageText = presetQuestion || input;
    if (!messageText.trim()) return;

    // Check if this is the second message and user is not authenticated
    if (messageCount >= 1 && !user) {
      // Add the user's question but don't generate response yet
      const userMsg = { text: messageText, sender: 'user' };
      addMessage(userMsg);
      incrementMessageCount();
      
      // Store the question for later response and show auth overlay
      setPendingQuestion(messageText);
      setShowAuthOverlay(true);
      
      if (!presetQuestion) setInput('');
      return;
    }
    
    // Normal flow - add message and generate response
    const userMsg = { text: messageText, sender: 'user' };
    addMessage(userMsg);
    incrementMessageCount();
    if (!presetQuestion) setInput('');
    
    // Generate bot response
    generateBotResponse(messageText);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed right-6 bottom-6 p-4 bg-[#0071e3] hover:bg-[#0077ed] rounded-full shadow-2xl transition-all hover:scale-105"
      >
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-white"/>
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#30d158] rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <aside className="h-full glass-card flex flex-col bg-black/80 dark:bg-black/80 backdrop-blur-2xl border-l border-black/10 dark:border-white/10 relative">
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.4);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 0 8px rgba(0, 113, 227, 0.1);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes sparkle-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes avatar-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .breathing {
          animation: breathe 3s ease-in-out infinite;
        }
        
        .floating-avatar {
          animation: float 4s ease-in-out infinite, avatar-pulse 6s ease-in-out infinite;
        }
        
        .sparkle-rotate {
          animation: sparkle-spin 8s linear infinite;
        }
      `}</style>
      
      <header className="p-6 border-b border-black/10 dark:border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 floating-avatar">
            <div 
              className="p-2.5 bg-[#0071e3] rounded-2xl transition-all duration-75 ease-linear"
            >
              <SparklesIcon className="h-5 w-5 text-white sparkle-rotate"/>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white text-lg">
                {user ? (
                  <span className="flex items-center gap-2">
                    Ozzie,{' '}
                    <button
                      onClick={signOut}
                      className="text-[#0071e3] hover:text-[#0077ed] transition-colors relative group"
                      title="Log out"
                    >
                      {user.email}
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Log out
                      </span>
                    </button>
                  </span>
                ) : (
                  'Ozzie'
                )}
              </h3>
              <p className="text-xs text-black/50 dark:text-white/50 font-light">Your OZ Investment Expert</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <XMarkIcon className="h-5 w-5 text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60"/>
          </button>
        </div>
      </header>
      
      {/* Preset Questions */}
      <div className="p-4 border-b border-black/10 dark:border-white/5">
        <p className="text-xs text-black/40 dark:text-white/40 mb-3 font-light">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(question)}
              className={`text-xs px-3 py-1.5 glass-card text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white rounded-full transition-all hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 ${highlightedQuestions.has(idx) ? 'breathing' : ''}`}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {!isHydrated ? (
          <div className="flex justify-start animate-fadeIn">
            <div className="max-w-[85%] glass-card text-black/90 dark:text-white/90 rounded-3xl rounded-tl-lg px-5 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <p className="text-sm leading-relaxed font-light">Loading conversation...</p>
            </div>
          </div>
        ) : (
          msgs.map(m => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[85%] ${
                m.sender === 'user'
                  ? 'bg-[#0071e3] text-white rounded-3xl rounded-tr-lg px-5 py-3'
                  : 'glass-card text-black/90 dark:text-white/90 rounded-3xl rounded-tl-lg px-5 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10'
              }`}>
                <p className="text-sm leading-relaxed font-light">{m.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <div className="p-6 border-t border-black/10 dark:border-white/5">
        <div className="flex gap-3">
          <input
            className="flex-1 px-5 py-3 glass-card rounded-full text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:border-black/20 dark:focus:border-white/20 text-sm font-light transition-all bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ask Ozzie anything about OZs..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend(e);
              }
            }}
          />
          <button 
            onClick={(e) => handleSend(e)}
            disabled={!input.trim()} 
            className="p-3 bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-black/10 dark:disabled:bg-white/10 rounded-full transition-all disabled:cursor-not-allowed hover:scale-105"
          >
            <PaperAirplaneIcon className="h-5 w-5 text-white"/>
          </button>
        </div>
      </div>

      {/* Auth Overlay */}
      {showAuthOverlay && (
        <AuthOverlay onClose={() => {
          setShowAuthOverlay(false);
          setPendingQuestion(null); // Clear pending question when user closes overlay
        }} />
      )}
    </aside>
  );
}