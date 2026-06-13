import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n';
import type { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, X, MessageCircle } from 'lucide-react';

export default function AIAssistant() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: t('ai.greeting'), timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    const lower = input.toLowerCase();
    let responseKey = 'Default';
    if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('beginner') || lower.includes('начинающ') || lower.includes('початк') || lower.includes('порад')) responseKey = 'Recommend';
    else if (lower.includes('enroll') || lower.includes('sign up') || lower.includes('join') || lower.includes('запис') || lower.includes('курс')) responseKey = 'Enroll';
    else if (lower.includes('schedule') || lower.includes('book') || lower.includes('time') || lower.includes('расписан') || lower.includes('розклад') || lower.includes('бронюв') || lower.includes('запис')) responseKey = 'Schedule';
    else if (lower.includes('video') || lower.includes('call') || lower.includes('meeting') || lower.includes('видео') || lower.includes('відео') || lower.includes('дзвінок')) responseKey = 'Video';
    else if (lower.includes('instructor') || lower.includes('teach') || lower.includes('create course') || lower.includes('преподавател') || lower.includes('викладач') || lower.includes('создать курс')) responseKey = 'Instructor';

    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: t(`ai.response${responseKey}`), timestamp: Date.now() + 1 };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white hover:bg-emerald-500 transition-all hover:scale-105">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ height: '500px' }}>
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
            <div>
              <div className="text-white font-semibold text-sm">{t('ai.title')}</div>
              <div className="text-emerald-200 text-xs">{t('ai.status')}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><Bot className="w-4 h-4 text-emerald-600" /></div>
                )}
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-700 rounded-bl-md'}`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><User className="w-4 h-4 text-white" /></div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {[t('ai.suggest1'), t('ai.suggest2'), t('ai.suggest3'), t('ai.suggest4')].map(s => (
                <button key={s} onClick={() => setInput(s)} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">{s}</button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-gray-100">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={t('ai.placeholder')}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="submit" className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white hover:bg-emerald-700 transition-colors flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
