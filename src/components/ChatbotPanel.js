// src/components/ChatbotPanel.js

'use client';
import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function ChatbotPanel() {
  const [msgs, setMsgs] = useState([
    { id:1, text:"Hi! I can help you analyze OZ investments, market trends, and zone performance. What would you like to know?", sender:'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const endRef = useRef(null);
  
  useEffect(() => endRef.current?.scrollIntoView({ behavior:'smooth' }), [msgs]);

  const send = (e) => {
    e.preventDefault();
    if(!input.trim()) return;
    const userMsg = { id:Date.now(), text:input, sender:'user' };
    setMsgs(ms => [...ms, userMsg]);
    setInput('');
    
    // Enhanced AI responses
    setTimeout(() => {
      let response = "";
      const query = input.toLowerCase();
      
      if(query.includes('california') || query.includes('ca')) {
        response = "California has 879 opportunity zones with $18.2B invested. Top performing zones are in LA (Downtown), San Francisco (Mission Bay), and San Diego (Barrio Logan). Average ROI: 26.3%";
      } else if(query.includes('texas') || query.includes('tx')) {
        response = "Texas shows strong OZ performance with 628 zones and $14.5B invested. Austin tech corridor zones are seeing 35%+ returns. Houston and Dallas also showing strong multifamily development.";
      } else if(query.includes('best') || query.includes('top')) {
        response = "Top performing OZ markets by ROI: 1) Miami, FL (32%), 2) Austin, TX (28%), 3) Phoenix, AZ (27%), 4) Nashville, TN (26%), 5) Denver, CO (24%)";
      } else if(query.includes('investment') || query.includes('invest')) {
        response = "Current investment trends show tech-focused OZs outperforming by 12%. Average deal size is $24.5M, up 15% YoY. Consider diversifying across multiple zones and sectors.";
      } else if(query.includes('tax')) {
        response = "OZ tax benefits: Defer capital gains until 2026, 10% reduction after 5 years, 15% after 7 years, and zero tax on OZ appreciation after 10-year hold.";
      } else {
        response = `I'm analyzing data for "${input.slice(0,30)}..." The market shows strong momentum with 87% of zones actively developing. Would you like specific state or sector analysis?`;
      }
      
      const botMsg = { id:Date.now()+1, text:response, sender:'bot' };
      setMsgs(ms => [...ms, botMsg]);
    }, 800);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed right-6 bottom-6 p-4 bg-blue-600 hover:bg-blue-700 rounded-full shadow-2xl transition-all group"
      >
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-white"/>
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <aside className="h-full bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 flex flex-col shadow-2xl">
      <header className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-blue-400"/>
          </div>
          <div>
            <h3 className="font-semibold text-white">OZ Intelligence Assistant</h3>
            <p className="text-xs text-gray-400">Powered by real-time data</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <XMarkIcon className="h-5 w-5 text-gray-400"/>
        </button>
      </header>
      
      <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-gradient-to-b from-gray-900 to-black/50">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.sender==='user'?'justify-end':'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[85%] ${
              m.sender==='user'
                ?'bg-blue-600/80 text-white rounded-2xl rounded-tr-sm px-4 py-3'
                :'bg-gray-800 border border-gray-700 text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3'
            }`}>
              <p className="text-sm">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      
      <form onSubmit={send} className="p-4 bg-black/50 border-t border-gray-800">
        <div className="flex space-x-2">
          <input
            className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            placeholder="Ask about zones, investments, ROI..."
          />
          <button 
            type="submit" 
            disabled={!input.trim()} 
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5 text-white"/>
          </button>
        </div>
      </form>
    </aside>
  );
}