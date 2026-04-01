/**
 * KindraFloat — Global floating AI assistant accessible from every portal section.
 *
 * Solves the problem: team members no longer need to switch to ChatGPT,
 * copy-paste responses, or leave their current work context.
 * Kindra floats over Tasks, Social Wall, Documents, Announcements — everywhere.
 */
import { useState, useRef, useEffect } from 'react';
import { X, Send, Maximize2, RefreshCw, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { buildKindraPrompt, KindraAvatar } from './AskKindra';

// ─── Simple markdown inline ───────────────────────────────────────────────────
function InlineText({ text }) {
  return (
    <span>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

function FloatMarkdown({ text }) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.match(/^[-•*]\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-•*]\s/)) {
        items.push(lines[i].replace(/^[-•*]\s/, ''));
        i++;
      }
      out.push(
        <ul key={`ul-${i}`} className="space-y-1 my-1.5 ml-0.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2">
              <span className="text-emerald-400 text-[10px] mt-1 flex-shrink-0">▸</span>
              <span className="flex-1 text-xs"><InlineText text={item} /></span>
            </li>
          ))}
        </ul>
      );
    } else if (line.trim() === '') {
      out.push(<div key={`g-${i}`} className="h-1" />);
      i++;
    } else {
      out.push(<p key={`p-${i}`} className="text-xs leading-relaxed"><InlineText text={line} /></p>);
      i++;
    }
  }
  return <div className="space-y-0.5">{out}</div>;
}

const FLOAT_GREETING = `Hi! I'm **Kindra** — ask me anything, right here in your portal. No need for ChatGPT! 🌿`;

export default function KindraFloat({ currentUser, onOpenFull }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'kindra', text: FLOAT_GREETING, id: 'greeting', ts: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [copied, setCopied] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg, id: Date.now(), ts: Date.now() }]);
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: buildKindraPrompt(messages, msg, currentUser) });
      const reply = (typeof res === 'string' ? res : res?.result || res?.response) || "I'm having trouble — please try again.";
      setMessages(prev => [...prev, { role: 'kindra', text: reply, id: Date.now() + 1, ts: Date.now() + 1 }]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'kindra', text: 'Something went wrong. Try again.', id: Date.now() + 1, ts: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([{ role: 'kindra', text: FLOAT_GREETING, id: 'greeting', ts: Date.now() }]);
    setInput('');
  };

  const copyMsg = (id, text) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, ''));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <style>{`
        @keyframes kf-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes kf-in { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes kf-ring { 0%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)} 70%{box-shadow:0 0 0 14px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
        .kf-panel { animation: kf-in 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      {/* ── Floating panel ── */}
      {open && (
        <div className="kf-panel fixed z-[9999] flex flex-col overflow-hidden"
          style={{
            bottom: 90, right: 24,
            width: 360, height: 520,
            background: 'rgba(3,7,18,0.97)',
            border: '1px solid rgba(16,185,129,0.18)',
            borderRadius: 20,
            boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.08), 0 0 40px rgba(16,185,129,0.08)',
            backdropFilter: 'blur(24px)',
          }}>

          {/* Panel header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(16,185,129,0.1)', background: 'rgba(0,0,0,0.3)' }}>
            <KindraAvatar size={32} glow />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">Ask Kindra</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 99, padding: '1px 6px' }}>
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />LIVE
                </span>
              </div>
              <p className="text-[10px] text-white/30">KCF AI · In your portal</p>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button onClick={reset} title="New chat"
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => { onOpenFull?.(); setOpen(false); }} title="Open full chat"
                className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-white/5 transition-all">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} title="Close"
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map(msg => (
              msg.role === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[82%] px-3.5 py-2.5 rounded-xl rounded-tr-sm text-xs text-white leading-relaxed"
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 2px 12px rgba(16,185,129,0.2)' }}>
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2.5 group">
                  <KindraAvatar size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide">Kindra</span>
                      <button onClick={() => copyMsg(msg.id, msg.text)}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10">
                        {copied === msg.id
                          ? <Check className="w-2.5 h-2.5 text-emerald-400" />
                          : <Copy className="w-2.5 h-2.5 text-white/30" />}
                      </button>
                    </div>
                    <div className="px-3.5 py-2.5 rounded-xl rounded-tl-sm text-white/70"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <FloatMarkdown text={msg.text} />
                    </div>
                  </div>
                </div>
              )
            ))}

            {loading && (
              <div className="flex items-start gap-2.5">
                <KindraAvatar size={24} />
                <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl rounded-tl-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts strip (when no conversation) */}
          {messages.length === 1 && (
            <div className="flex-shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto">
              {['Draft an announcement', 'Explain KCF pillars', 'Help me write a post', 'Volunteer badge info'].map((p, i) => (
                <button key={i} onClick={() => send(p)}
                  className="flex-shrink-0 text-[10px] text-white/40 hover:text-white/70 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 px-4 pb-4 pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                disabled={loading}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent border-none outline-none text-xs text-white/80 placeholder-white/20 disabled:opacity-40"
              />
              <button onClick={() => send()} disabled={!input.trim() || loading}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-25 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                <Send className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating trigger button ── */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) setUnread(0); }}
        className="fixed z-[9998] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          bottom: 24, right: 24,
          width: 56, height: 56,
          borderRadius: 16,
          background: open
            ? 'rgba(5,150,105,0.9)'
            : 'linear-gradient(135deg, #059669 0%, #10b981 60%, #34d399 100%)',
          boxShadow: open
            ? '0 4px 20px rgba(16,185,129,0.3)'
            : '0 8px 30px rgba(16,185,129,0.4), 0 0 0 0 rgba(16,185,129,0.5)',
          animation: !open ? 'kf-ring 3s ease-in-out infinite' : 'none',
        }}
        title="Ask Kindra">
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <span className="font-black text-white text-lg select-none" style={{ fontFamily: "'Syne', sans-serif" }}>K</span>
        )}
        {/* Unread badge */}
        {unread > 0 && !open && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#030712]">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
