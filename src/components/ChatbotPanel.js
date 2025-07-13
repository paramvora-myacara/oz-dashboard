// src/components/ChatbotPanel.js

// Enhanced ChatbotPanel.js with unified design

'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useChatStore } from '@/stores/chatStore';
import AuthOverlay from './AuthOverlay';
import ReactMarkdown from 'react-markdown';

export default function ChatbotPanel() {
  const { user, loading, signOut, getCurrentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    getCurrentConversation,
    getCurrentMessageCount,
    addMessage,
    incrementMessageCount,
    setCurrentUser,
    copyGuestToUser,
    setPendingQuestion,
    getPendingQuestion,
    clearPendingQuestion,
    restoreGuestForAuth
  } = useChatStore();

  // Helper function to get user's first name
  const getUserFirstName = (user) => {
    if (!user) return '';
    
    // Try to get name from user metadata (Google OAuth typically stores this)
    if (user.user_metadata) {
      if (user.user_metadata.first_name) {
        return user.user_metadata.first_name;
      }
      if (user.user_metadata.full_name) {
        return user.user_metadata.full_name.split(' ')[0];
      }
      if (user.user_metadata.name) {
        return user.user_metadata.name.split(' ')[0];
      }
    }
    
    // Fallback: extract first name from email
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      // If email has dots, take first part; otherwise take first 10 chars
      return emailPrefix.includes('.') 
        ? emailPrefix.split('.')[0] 
        : emailPrefix.substring(0, 10);
    }
    
    return user.email || 'User';
  };

  const [input, setInput] = useState('');
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [highlightedQuestions, setHighlightedQuestions] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Handle hydration to prevent SSR/client mismatch
  useEffect(() => {
    setIsHydrated(true);
    // Restore guest conversation after OAuth redirect
    restoreGuestForAuth();
  }, []);

  // Check for auth requirement from URL parameters (middleware redirect)
  useEffect(() => {
    const authRequired = searchParams.get('auth') === 'required';
    const returnTo = searchParams.get('returnTo');
    
    if (authRequired && !user && !loading) {
      setShowAuthOverlay(true);
      
      // Store returnTo URL for after auth
      if (returnTo) {
        sessionStorage.setItem('returnTo', returnTo);
      }
      
      // Clean up URL parameters
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('auth');
      newUrl.searchParams.delete('returnTo');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, user, loading]);
  
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
      const guestConversation = state.conversations.guest;
      const pendingQuestion = getPendingQuestion();
      
      // Only copy from guest if:
      // 1. User doesn't have existing conversation AND
      // 2. Guest has meaningful conversation (more than just welcome message)
      const hasGuestContent = guestConversation && guestConversation.messages.length > 1;
      
      if (!userHasConversation && hasGuestContent) {
        // User is logging in mid-conversation, preserve chat history
        copyGuestToUser(user.id);
      } else if (userHasConversation) {
        // User has existing conversation, just switch to it
        setCurrentUser(user.id);
      } else {
        // User has no conversation and no guest content, create fresh
        setCurrentUser(user.id);
      }
      
      // Close auth overlay if it's open
      if (showAuthOverlay) {
        setShowAuthOverlay(false);
      }
      
      // Check if we've already processed a redirect in this session
      const redirectProcessed = sessionStorage.getItem('authFlow_redirectProcessed');
      if (redirectProcessed) {
        return;
      }
      
      // Check for returnTo URL after successful auth
      const returnTo = sessionStorage.getItem('returnTo');
      const authFlowReturnTo = sessionStorage.getItem('authFlow_returnTo');
      
      // Try both storage locations
      const finalReturnTo = returnTo || authFlowReturnTo;
      
      if (finalReturnTo && finalReturnTo !== '/') {
        // Mark that we've processed a redirect in this session
        sessionStorage.setItem('authFlow_redirectProcessed', 'true');
        // Clean up auth-related storage
        sessionStorage.removeItem('returnTo');
        sessionStorage.removeItem('authFlow_returnTo');
        sessionStorage.removeItem('authFlow_debug');
        router.push(finalReturnTo);
        return; // Don't process pending question if we're redirecting
      } else {
      }
      
      // If there was a pending question, answer it now (only once)
      if (pendingQuestion) {
        // Clear pending question immediately to prevent multiple executions
        clearPendingQuestion();
        
        // Generate response directly without extra message
        setTimeout(() => {
          generateBotResponse(pendingQuestion);
        }, 300);
      }
    } else {
      // User signed out - switch back to guest and clear redirect flag
      sessionStorage.removeItem('authFlow_redirectProcessed');
      setCurrentUser('guest');
    }
  }, [user, showAuthOverlay, copyGuestToUser, setCurrentUser, getPendingQuestion, clearPendingQuestion, router]);

  const handlePresetClick = (question) => {
    handleSend(null, question);
  };

  // Replace generateBotResponse with an async API call
  const generateBotResponse = async (messageText) => {
    // Add a loading message with proper ID
    const loadingMsg = { 
      text: 'Ozzie is thinking...', 
      sender: 'bot', 
      isLoading: true,
      id: crypto?.randomUUID ? crypto.randomUUID() : `loading-${Date.now()}-${Math.random()}`
    };
    addMessage(loadingMsg);

    // Prepare payload
    // Get the current user directly from Supabase to ensure we have the correct ID
    const { user: currentUser } = await getCurrentUser();
    const userId = currentUser?.id || user?.id || 'guest';
    const backendUrl = process.env.NEXT_PUBLIC_OZ_BACKEND_URL || 'http://localhost:8001';
    
    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message: messageText })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error response:', errorText);
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      
      // Remove the loading message and add the actual response
      // We need to remove the loading message first, then add the real response
      const currentConversation = getCurrentConversation();
      const messagesWithoutLoading = currentConversation.messages.filter(msg => !msg.isLoading);
      
      // Create the response message with a proper ID
      const responseMessage = {
        text: data.response,
        sender: 'bot',
        id: crypto?.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random()}`
      };
      
      // Update the store with messages without loading, then add the response
      useChatStore.setState((state) => ({
        conversations: {
          ...state.conversations,
          [state.currentUserId]: {
            ...state.conversations[state.currentUserId],
            messages: [...messagesWithoutLoading, responseMessage]
          }
        }
      }));
      
    } catch (err) {
      console.error('Ozzie backend error:', err);
      
      // Remove loading message and add error message
      const currentConversation = getCurrentConversation();
      const messagesWithoutLoading = currentConversation.messages.filter(msg => !msg.isLoading);
      
      // Create the error message with a proper ID
      const errorMessage = {
        text: 'Sorry, Ozzie is having trouble responding right now. Please try again later.',
        sender: 'bot',
        id: crypto?.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random()}`
      };
      
      useChatStore.setState((state) => ({
        conversations: {
          ...state.conversations,
          [state.currentUserId]: {
            ...state.conversations[state.currentUserId],
            messages: [...messagesWithoutLoading, errorMessage]
          }
        }
      }));
    }
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
      
      if (!presetQuestion) {
        setInput('');
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = '48px';
        }
      }
      return;
    }
    
    // Normal flow - add message and generate response
    const userMsg = { text: messageText, sender: 'user' };
    addMessage(userMsg);
    incrementMessageCount();
    if (!presetQuestion) {
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
      }
    }
    
    // Generate bot response
    generateBotResponse(messageText);
  };

  // Get returnTo from URL params or sessionStorage
  const getReturnTo = () => {
    const returnFromUrl = searchParams.get('returnTo');
    const returnFromSession = typeof window !== 'undefined' ? sessionStorage.getItem('returnTo') : null;
    const authFlowReturnTo = typeof window !== 'undefined' ? sessionStorage.getItem('authFlow_returnTo') : null;
    const result = returnFromUrl || returnFromSession || authFlowReturnTo || '/';
    
    // Store returnTo in both locations for persistence
    if (returnFromUrl && returnFromUrl !== '/') {
      sessionStorage.setItem('returnTo', returnFromUrl);
      sessionStorage.setItem('authFlow_returnTo', returnFromUrl);
    }
    
    return result;
  };

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
                  <span>
                    Ozzie, <span className="text-[#0071e3]">{getUserFirstName(user)}</span>
                  </span>
                ) : (
                  'Ozzie'
                )}
              </h3>
              <p className="text-xs text-black/50 dark:text-white/50 font-light">Your OZ Investment Expert</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all relative group"
                title="Log out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60"/>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Log out
                </span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Preset Questions */}
      <div className="p-6 border-b border-black/10 dark:border-white/5">
        <div className="grid grid-cols-2 gap-2">
          {presetQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(question)}
              className={`p-3 text-xs text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white glass-card rounded-2xl transition-all text-left font-light hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 ${
                highlightedQuestions.has(index) ? 'breathing' : ''
              }`}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      
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
          msgs.map((m, index) => (
            <div key={m.id || `fallback-${index}`} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[85%] ${
                m.sender === 'user'
                  ? 'bg-[#0071e3] text-white rounded-3xl rounded-tr-lg px-5 py-3'
                  : 'glass-card text-black/90 dark:text-white/90 rounded-3xl rounded-tl-lg px-5 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10'
              }`}>
                <div className="text-sm leading-relaxed font-light">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <span>{children}</span>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em>{children}</em>
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <div className="p-6 border-t border-black/10 dark:border-white/5">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            className="flex-1 px-5 py-3 glass-card rounded-2xl text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:border-black/20 dark:focus:border-white/20 text-sm font-light transition-all bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 resize-none overflow-hidden min-h-[48px] max-h-[120px]"
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ask Ozzie anything about OZs..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            onInput={(e) => {
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button 
            onClick={(e) => handleSend(e)}
            disabled={!input.trim()} 
            className="p-3 bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-black/10 dark:disabled:bg-white/10 rounded-full transition-all disabled:cursor-not-allowed hover:scale-105 flex-shrink-0"
          >
            <PaperAirplaneIcon className="h-5 w-5 text-white"/>
          </button>
        </div>
      </div>

      {/* Auth Overlay */}
      {showAuthOverlay && (
        <AuthOverlay 
          onClose={() => {
            setShowAuthOverlay(false);
            clearPendingQuestion(); // Clear pending question when user closes overlay
          }}
          returnTo={getReturnTo()}
        />
      )}
    </aside>
  );
}