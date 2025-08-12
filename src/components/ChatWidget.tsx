'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hi! I can help with youth sports injury prevention and recovery. Ask about stretching, when to see a doctor, return-to-play, concussion safety, or hydration/nutrition.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;
    const nextMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data: { reply?: string; error?: string } = await res.json();
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'Request failed');
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply! }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I had trouble answering just now. Please try again or rephrase your question.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          aria-label="Open chat"
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 inline-flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Ask Recovery AI
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 h-[28rem] bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-orange-500 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-semibold">Recovery AI Assistant</span>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ' +
                    (m.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-gray-500">Thinking…</div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 p-3">
            <div className="text-[10px] text-gray-500 mb-2">
              Educational only. Not medical advice. For urgent concerns, seek professional care.
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about prevention, recovery, or return-to-play…"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="inline-flex items-center justify-center bg-orange-500 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50 hover:bg-orange-600"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



