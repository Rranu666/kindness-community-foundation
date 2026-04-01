import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Copy, Check, RefreshCw, Zap } from 'lucide-react';

// ─── Kindra persona ────────────────────────────────────────────────────────────
const GREETING = `Hi there! 👋 I'm **Kindra** — KCF's AI assistant, built right into your portal.

No more switching to ChatGPT, copying responses, or losing context. I'm here, inside your workspace.

I can help you with:
- **Team writing** — announcements, messages, posts, reports
- **KCF knowledge** — mission, pillars, programs, governance
- **Volunteer & giving** — badges, hours, KindnessConnect
- **Brainstorming** — events, campaigns, community ideas
- **General tasks** — anything you need answered

What's on your mind?`;

const STARTERS = [
  { emoji: '✍️', label: 'Draft', text: 'Draft a team announcement about a new community milestone' },
  { emoji: '🌿', label: 'Pillars', text: 'What are KCF\'s 6 pillars and how do they work together?' },
  { emoji: '🎯', label: 'Volunteer', text: 'How does the volunteer badge system work?' },
  { emoji: '💡', label: 'Ideas', text: 'Give me 5 ideas for a community kindness campaign' },
  { emoji: '📣', label: 'Post', text: 'Write a social wall post celebrating our team this week' },
  { emoji: '💸', label: 'Giving', text: 'Explain KindnessConnect giving plans to a new member' },
  { emoji: '📱', label: 'Apps', text: 'Tell me about KindWave and our tech ecosystem' },
  { emoji: '🤝', label: 'Partners', text: 'Which charities does KCF partner with and why?' },
];

// ─── Shared AI logic (exported so KindraFloat can use it too) ─────────────────
export function buildKindraPrompt(messages, userMsg, currentUser) {
  const history = messages
    .filter(m => !(m.role === 'kindra' && m.id === 'greeting'))
    .slice(-10)
    .map(m => m.role === 'user' ? `User: ${m.text}` : `Kindra: ${m.text}`)
    .join('\n');

  return `You are Kindra, the AI assistant embedded in the Kindness Community Foundation (KCF) team portal (Synergy Hub). You replace the need to use ChatGPT externally — you are built directly into the workspace.

Your personality: warm, encouraging, practical, clear. Format responses with **bold** for key terms and - bullet lists for multiple items. Keep responses focused and useful.

KCF KNOWLEDGE BASE:
- Mission: Community stabilization, ethical participation, technology-assisted volunteer coordination
- 6 Pillars: Education, Economic Empowerment, Health & Wellness, Community Development, Environmental Sustainability, Cultural Preservation
- Volunteer badges: First Steps (5hrs), Champion (25hrs), Leader (50hrs), Ambassador (100hrs), Lifetime (250hrs)
- KindnessConnect: $5/mo giving plans, micro-donation roundups, 15% conscious shopping cashback, 5% platform fee (0% on cashback)
- Partner charities: Feeding America (hunger), Water.org (clean water), Save the Children (education), One Tree Planted (climate), Ocean Conservancy (ocean), UNICEF (children)
- Apps: KindWave (community kindness map app), ServiceConnectPro.ai (AI service coordination), FreeAppMaker.ai (no-code app builder)
- Team Portal = Synergy Hub: messaging, tasks, docs, announcements, social wall, AI assistant
- Governance: 12-traditions Kindness Constitution, transparent board, California-based nonprofit
- Contact: contact@kindnesscommunityfoundation.com
${currentUser?.full_name ? `- You are speaking with: ${currentUser.full_name}` : ''}

CONVERSATION HISTORY:
${history || '(new conversation)'}

USER QUESTION: ${userMsg}

Respond as Kindra. Be warm and practical. Use **bold** and - bullets where helpful. Never say you're ChatGPT or made by OpenAI.`;
}

// ─── Markdown renderer ─────────────────────────────────────────────────────────
function MarkdownText({ text }) {
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
        <ul key={`ul-${i}`} className="space-y-1.5 my-2 ml-1">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5">
              <span className="text-emerald-400 text-xs mt-1 flex-shrink-0">▸</span>
              <span className="flex-1">{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else if (line.trim() === '') {
      out.push(<div key={`gap-${i}`} className="h-1.5" />);
      i++;
    } else {
      out.push(<p key={`p-${i}`} className="leading-relaxed">{inlineFormat(line)}</p>);
      i++;
    }
  }
  return <div className="space-y-0.5 text-sm">{out}</div>;
}

function inlineFormat(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

// ─── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text.replace(/\*\*/g, '')); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all" title="Copy">
      {done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/35 hover:text-white/60" />}
    </button>
  );
}

// ─── Kindra Avatar ─────────────────────────────────────────────────────────────
export function KindraAvatar({ size = 36, glow = false }) {
  return (
    <div className="flex-shrink-0 rounded-2xl flex items-center justify-center font-black text-white select-none relative"
      style={{
        width: size, height: size, fontSize: size * 0.4,
        background: 'linear-gradient(135deg, #059669 0%, #10b981 60%, #34d399 100%)',
        boxShadow: glow
          ? `0 0 0 2px rgba(16,185,129,0.3), 0 0 30px rgba(16,185,129,0.4), 0 0 60px rgba(16,185,129,0.15)`
          : `0 0 0 1.5px rgba(16,185,129,0.25)`,
      }}>
      K
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────────────
export default function AskKindra({ currentUser }) {
  const [messages, setMessages] = useState([
    { role: 'kindra', text: GREETING, id: 'greeting', ts: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setMessages(prev => [...prev, { role: 'user', text: msg, id: Date.now(), ts: Date.now() }]);
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: buildKindraPrompt(messages, msg, currentUser) });
      const reply = (typeof res === 'string' ? res : res?.result || res?.response) || "I'm having trouble right now — please try again.";
      setMessages(prev => [...prev, { role: 'kindra', text: reply, id: Date.now() + 1, ts: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, { role: 'kindra', text: 'Something went wrong. Please try again.', id: Date.now() + 1, ts: Date.now() + 1 }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const reset = () => {
    setMessages([{ role: 'kindra', text: GREETING, id: 'greeting', ts: Date.now() }]);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const hasChat = messages.length > 1;

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ background: '#030712' }}>

      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)', animation: 'kindra-orb1 12s ease-in-out infinite' }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #059669, transparent 70%)', animation: 'kindra-orb2 15s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)', animation: 'kindra-orb3 20s ease-in-out infinite' }} />
      </div>

      <style>{`
        @keyframes kindra-orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,20px) scale(1.1)} }
        @keyframes kindra-orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,-20px) scale(1.08)} }
        @keyframes kindra-orb3 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 33%{transform:translate(-50%,-50%) scale(1.05)} 66%{transform:translate(-50%,-50%) scale(0.97)} }
        @keyframes kindra-pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(16,185,129,0.4)} 50%{opacity:0.8;box-shadow:0 0 0 8px rgba(16,185,129,0)} }
        @keyframes kindra-typing { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
      `}</style>

      {/* ── Header ── */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.12)', background: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-4">
          <KindraAvatar size={44} glow />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-white font-black text-lg tracking-tight">Ask Kindra</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  style={{ animation: 'kindra-pulse 2s infinite' }} />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-white/35 font-medium tracking-wide">KCF Team AI · Always here, no copy-paste needed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChat && (
            <button onClick={reset}
              className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors px-3 py-2 rounded-xl hover:bg-white/[0.05]">
              <RefreshCw className="w-3.5 h-3.5" /> New chat
            </button>
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {messages.map(msg => (
          msg.role === 'user' ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[75%]">
                <div className="px-5 py-3.5 rounded-2xl rounded-tr-sm text-sm text-white leading-relaxed"
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', boxShadow: '0 4px 20px rgba(16,185,129,0.25)' }}>
                  {msg.text}
                </div>
                <p className="text-right text-[10px] text-white/20 mt-1 pr-1">
                  {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex items-start gap-4 group">
              <KindraAvatar size={34} glow={msg.id === 'greeting'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-emerald-400 tracking-wide uppercase">Kindra</span>
                  <span className="text-[10px] text-white/20">
                    {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <CopyBtn text={msg.text} />
                </div>
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm text-white/75 leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <MarkdownText text={msg.text} />
                </div>
              </div>
            </div>
          )
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-4">
            <KindraAvatar size={34} />
            <div className="flex items-center gap-1.5 px-5 py-4 rounded-2xl rounded-tl-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[0, 1, 2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-emerald-400/70"
                  style={{ animation: `kindra-typing 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Starter prompts ── */}
      {!hasChat && (
        <div className="relative z-10 flex-shrink-0 px-6 pb-4">
          <p className="text-[10px] text-white/20 text-center uppercase tracking-widest mb-3">Suggested prompts</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {STARTERS.map((s, i) => (
              <button key={i} onClick={() => send(s.text)} disabled={loading}
                className="group flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                <span className="text-base leading-none mt-0.5 flex-shrink-0">{s.emoji}</span>
                <div>
                  <div className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-0.5">{s.label}</div>
                  <div className="text-xs text-white/45 group-hover:text-white/65 transition-colors leading-snug">{s.text}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="relative z-10 flex-shrink-0 px-6 pb-5 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
          <textarea
            ref={el => { inputRef.current = el; textareaRef.current = el; }}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px';
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            disabled={loading}
            placeholder="Ask Kindra anything — she's right here in your portal…"
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white/80 placeholder-white/20 resize-none leading-relaxed disabled:opacity-40"
            style={{ minHeight: '22px', maxHeight: '130px' }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="flex-shrink-0 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-25"
            style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-white/15 mt-2 flex items-center justify-center gap-1">
          <Zap className="w-3 h-3" />
          Kindra is powered by KCF AI · Integrated directly into your portal
        </p>
      </div>
    </div>
  );
}
