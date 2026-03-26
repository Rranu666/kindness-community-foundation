import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Sparkles } from 'lucide-react';

const suggestions = [
  'What is KCF and what are its initiatives?',
  'Draft a team announcement about a new milestone',
  'Help me write a kindness-focused message to the team',
  'What is ServiceConnectPro.ai?',
  'Give me tips for effective community building',
  'How do I use the Social Wall?',
  'Tell me about FreeAppMaker.ai',
  'Help me plan a volunteer event',
];

export default function AIChat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg, id: Date.now() }]);
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the AI Assistant for Kindness Community Foundation (KCF) — a California nonprofit building ethical, technology-assisted volunteer networks.

KCF INFO:
- Founder: Fred A. Behr
- Mission: Community stabilization, ethical participation, technology-assisted volunteer coordination
- Pillars: Education, Economic Empowerment, Health & Wellness, Community Development, Environmental Sustainability, Cultural Preservation
- Initiatives: Volunteer Network (badges: First Steps 5hrs, Champion 25hrs, Leader 50hrs, Ambassador 100hrs, Lifetime 250hrs), KindnessConnect (giving platform: $5/mo plans, card roundups, 15% cashback), Community Stories, Team Portal (Synergy Hub), Analytics, Governance
- Contact: contact@kindnesscommunityfoundation.com | California, USA
- Apps: KindWave App, ServiceConnectPro.ai, FreeAppMaker.ai

Answer helpfully and warmly. If unrelated to KCF, you can still help as a general assistant.

USER: ${msg}`,
      });
      const reply = (typeof res === 'string' ? res : res?.result || res?.response) || 'Sorry, I could not process that.';
      setMessages(prev => [...prev, { role: 'ai', text: reply, id: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.', id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-black text-base" style={{ fontFamily: "'Syne', sans-serif" }}>AI Assistant</h2>
          <p className="text-xs text-white/30">Kindness Synergy Hub AI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(236,72,153,0.1))' }}>
              <Sparkles className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-white font-black text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Kindness AI Assistant</h3>
            <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">Ask me anything — about KCF, team tasks, writing help, or general knowledge.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white/80 border border-white/[0.07] hover:border-rose-500/30 transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'ai' && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white rounded-br-sm' : 'text-white/80 border border-white/[0.07] rounded-bl-sm'}`}
              style={{ background: msg.role === 'user' ? 'linear-gradient(135deg, #f43f5e, #ec4899)' : 'rgba(255,255,255,0.05)' }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl border border-white/[0.07] flex gap-1 items-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white/80 placeholder-white/25 disabled:opacity-50"
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}