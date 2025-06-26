// src/components/ChatbotPanel.js

'use client';
import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function ChatbotPanel() {
  const [msgs, setMsgs] = useState([
    { 
      id: 1, 
      text: "Hey there! I'm Ozzie, your AI-powered Opportunity Zone expert. I can help you understand OZ investments, tax benefits, market trends, and find the best opportunities for your portfolio. What would you like to explore today?", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
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

  const handlePresetClick = (question) => {
    handleSend(null, question);
  };

  const handleSend = (e, presetQuestion = null) => {
    if (e) e.preventDefault();
    const messageText = presetQuestion || input;
    if (!messageText.trim()) return;
    
    const userMsg = { id: Date.now(), text: messageText, sender: 'user' };
    setMsgs(ms => [...ms, userMsg]);
    if (!presetQuestion) setInput('');
    
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
      
      const botMsg = { id: Date.now() + 1, text: response, sender: 'bot' };
      setMsgs(ms => [...ms, botMsg]);
    }, 800);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed right-6 bottom-6 p-4 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all"
      >
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-white"/>
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <aside className="h-full bg-gray-900 border-l border-gray-800 flex flex-col">
      <header className="p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <SparklesIcon className="h-5 w-5 text-white"/>
            </div>
            <div>
              <h3 className="font-semibold text-white">Ozzie</h3>
              <p className="text-xs text-gray-400">Your OZ Investment Expert</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400"/>
          </button>
        </div>
      </header>
      
      {/* Preset Questions */}
      <div className="p-3 border-b border-gray-800 bg-gray-900/50">
        <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(question)}
              className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full transition-all"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3'
                : 'bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3'
            }`}>
              <p className="text-sm leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={(e) => handleSend(e)} className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-2">
          <input
            className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ask Ozzie anything about OZs..."
          />
          <button 
            type="submit" 
            disabled={!input.trim()} 
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5 text-white"/>
          </button>
        </div>
      </form>
    </aside>
  );
}