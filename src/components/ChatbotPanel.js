'use client';
import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function ChatbotPanel() {
  const [msgs, setMsgs] = useState([
    { id:1, text:"Hi, I'm Ozzie—your OZ insights bot!", sender:'bot', ts:new Date() }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior:'smooth' }), [msgs]);

  const send = (e) => {
    e.preventDefault();
    if(!input.trim()) return;
    const userMsg = { id:Date.now(), text:input, sender:'user', ts:new Date() };
    setMsgs(ms => [...ms, userMsg]);
    setInput('');
    setTimeout(() => {
      const botMsg = {
        id:Date.now()+1,
        text:`Demo reply to "${input.slice(0,20)}…"`,
        sender:'bot', ts:new Date()
      };
      setMsgs(ms => [...ms, botMsg]);
    }, 700);
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-bg-card border-l overflow-y-auto flex flex-col h-screen">
      <header className="p-4 bg-brand-primary text-white flex items-center space-x-2">
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6"/>
        <h3 className="font-semibold">Ozzie Assistant</h3>
      </header>
      <div className="flex-grow p-4 space-y-3">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.sender==='user'?'justify-end':'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] ${m.sender==='user'?'bg-brand-secondary text-white':'bg-white border'}`}>
              {m.text}
              <div className="text-xs text-text-secondary mt-1 text-right">
                {m.ts.toLocaleTimeString([], { hour:'2-digit',minute:'2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <form onSubmit={send} className="p-4 bg-white border-t flex space-x-2">
        <input
          className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-brand-accent"
          value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Ozzie…"
        />
        <button type="submit" disabled={!input.trim()} className="p-2 bg-brand-accent rounded-lg disabled:opacity-50">
          <PaperAirplaneIcon className="h-5 w-5 text-white"/>
        </button>
      </form>
    </aside>
  );
} 