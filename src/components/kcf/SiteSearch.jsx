/**
 * SiteSearch — Header search icon now opens a full Kindra AI chat panel.
 * Same props interface (isOpen, onClose) so Header.jsx is unchanged.
 * Matches KindraWebBot's UI: conversation history, quick chips, typing indicator,
 * markdown, voice input, copy, reset — but presented as a centered modal.
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, RefreshCw, Mic, MicOff, Copy, Check, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KindraAvatar } from "@/components/synergy/AskKindra";

// ─── Markdown renderer (same pattern as KindraWebBot) ─────────────────────────
function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+|mailto:[^)]+)\))/g);
  const out = [];
  let i = 0;
  while (i < parts.length) {
    const p = parts[i];
    if (!p) { i++; continue; }
    if (p.startsWith("**") && p.endsWith("**")) {
      out.push(<strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>);
    } else if (p.startsWith("[")) {
      const m = p.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) {
        out.push(
          <a key={i} href={m[2]} className="text-emerald-400 underline hover:text-emerald-300"
            onClick={e => e.stopPropagation()}>{m[1]}</a>
        );
      } else { out.push(<span key={i}>{p}</span>); }
    } else {
      out.push(<span key={i}>{p}</span>);
    }
    i++;
  }
  return <span>{out}</span>;
}

function BotMarkdown({ text }) {
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.match(/^[-•*]\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-•*]\s/)) {
        items.push(lines[i].replace(/^[-•*]\s/, ""));
        i++;
      }
      out.push(
        <ul key={`ul-${i}`} className="space-y-1 my-1.5 ml-0.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2">
              <span className="text-emerald-400 text-[10px] mt-[5px] flex-shrink-0">▸</span>
              <span className="flex-1 text-sm leading-relaxed"><InlineText text={item} /></span>
            </li>
          ))}
        </ul>
      );
    } else if (line.trim() === "") {
      out.push(<div key={`g-${i}`} className="h-1.5" />);
      i++;
    } else {
      out.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed">
          <InlineText text={line} />
        </p>
      );
      i++;
    }
  }
  return <div className="space-y-0.5">{out}</div>;
}

// ─── AI prompt ─────────────────────────────────────────────────────────────────
function buildPrompt(messages, userMsg) {
  const history = messages
    .filter(m => m.id !== "greeting")
    .slice(-8)
    .map(m => m.role === "user" ? `Visitor: ${m.text}` : `Kindra: ${m.text}`)
    .join("\n");

  return `You are Kindra, the friendly AI support assistant on the Kindness Community Foundation (KCF) public website. You help visitors navigate the site, learn about KCF, and get support.

Personality: warm, clear, helpful, concise. Use **bold** for key terms and - bullet lists for steps or multiple items. Always mention the relevant page path so visitors know where to go.

KCF KNOWLEDGE BASE:
- Mission: Community stabilization, ethical participation, technology-assisted volunteer coordination. California-based nonprofit.
- 6 Pillars: Education, Economic Empowerment, Health & Wellness, Community Development, Environmental Sustainability, Cultural Preservation
- Pages: Home (/), Volunteer (/volunteer), Serve Kindness (/servekindness), My Giving (/mygiving), Blog (/blog), Contact (/contact), KindWave App (/kindwave), KindCalmUnity (/kindcalmunity), Join Team (/jointeam), Synergy Hub — team portal (/synergyhub), KindLearn — language learning (/kindlearn)
- Volunteer badge system: First Steps (5h) → Champion (25h) → Leader (50h) → Ambassador (100h) → Lifetime (250h+)
- KindnessConnect: $5/mo giving plans, micro-donation roundups, 15% conscious shopping cashback. Fee: 5% on plans/roundups, 0% on cashback
- KindWave App: Mobile-first kindness map — live pins of kindness acts, post help requests, connect with neighbours
- KindCalmUnity: Cooperative community living — shared meals, childcare, gardening, carpools with fair rotation
- KindLearn: Free gamified language learning app — 30-day challenges, Spanish, French, Japanese & more
- Partner charities: Feeding America, Water.org, Save the Children, One Tree Planted, Ocean Conservancy, UNICEF
- Contact: contact@kindnesscommunityfoundation.com | Newport Beach, California

If you cannot answer, say: "I'm not sure about that — please email us at contact@kindnesscommunityfoundation.com 💚"

RESPONSE RULES: Be warm, concise and useful. Use **bold** for key terms. Use - bullet lists for multiple items.

CONVERSATION HISTORY:
${history || "(new conversation)"}

USER QUESTION: ${userMsg}`;
}

// ─── Quick chips ───────────────────────────────────────────────────────────────
const QUICK_CHIPS = [
  { emoji: "🌿", text: "What is KCF and what do you do?" },
  { emoji: "🙌", text: "How can I volunteer with KCF?" },
  { emoji: "📱", text: "Tell me about the KindWave app" },
  { emoji: "💚", text: "How do I make a donation?" },
  { emoji: "🌍", text: "Tell me about KindLearn" },
  { emoji: "📧", text: "How do I contact support?" },
];

// ─── Greeting ──────────────────────────────────────────────────────────────────
const GREETING = `Hi there! 👋 I'm **Kindra** — KCF's AI support assistant.

I'm here to help you:
- **Navigate** the KCF website
- **Learn** about our mission and programs
- **Find** volunteer & giving opportunities
- **Get answers** about KindWave, KindCalmUnity, KindLearn & more

What can I help you with today? 💚`;

// ─── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ msgId, text, copied, onCopy }) {
  return (
    <button
      onClick={() => onCopy(msgId, text)}
      className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
      title="Copy"
    >
      {copied === msgId
        ? <Check className="w-3 h-3 text-emerald-400" />
        : <Copy className="w-3 h-3 text-white/30 hover:text-white/60" />}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function SiteSearch({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: GREETING, id: "greeting", ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(null);
  const [copied, setCopied] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recRef = useRef(null);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", text: msg, id: Date.now(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt([...messages, userMsg], msg),
      });
      let reply =
        (typeof res === "string" ? res : res?.result || res?.response) ||
        "I'm having trouble right now — please try again or email us at contact@kindnesscommunityfoundation.com 💚";

      const uncertain = /not sure|don't know|can't find|unable to|I don't have|no information/i.test(reply);
      if (uncertain && !reply.includes("contact@")) {
        reply += "\n\n📧 **Need more help?** Email us: [contact@kindnesscommunityfoundation.com](mailto:contact@kindnesscommunityfoundation.com)";
      }

      setMessages(prev => [...prev, { role: "bot", text: reply, id: Date.now() + 1, ts: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "Something went wrong — please try again or email [contact@kindnesscommunityfoundation.com](mailto:contact@kindnesscommunityfoundation.com) 💚",
        id: Date.now() + 1,
        ts: Date.now() + 1,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const reset = () => {
    setMessages([{ role: "bot", text: GREETING, id: "greeting", ts: Date.now() }]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const copyMsg = (id, text) => {
    navigator.clipboard.writeText(
      text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    );
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Voice ──────────────────────────────────────────────────────────────────
  const hasVoice =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const toggleVoice = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    setMicError(null);
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;

    let resolved = false;
    const done = (transcript, errMsg) => {
      if (resolved) return;
      resolved = true;
      setListening(false);
      if (transcript) {
        setInput(prev => (prev ? prev + " " : "") + transcript);
      } else if (errMsg) {
        setMicError(errMsg);
        setTimeout(() => setMicError(null), 4000);
      }
    };

    rec.onresult = (e) => done(e.results[0][0].transcript, null);
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        done(null, "🎤 Mic blocked — allow microphone access in your browser settings");
      } else if (e.error === "no-speech") {
        done(null, null); // silent — just stop listening
      } else if (e.error === "audio-capture") {
        done(null, "🎤 No microphone found — connect one and try again");
      } else if (e.error === "network") {
        done(null, "🌐 Network error — check your connection and try again");
      } else {
        done(null, "Could not record — try again");
      }
    };
    rec.onend = () => done(null, null);

    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      setMicError("Could not start microphone — try again");
      setTimeout(() => setMicError(null), 4000);
    }
  };

  const hasChat = messages.length > 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9980] flex items-start justify-center pt-20 px-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(3,7,18,0.75)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.34, 1.3, 0.64, 1] }}
            className="relative w-full max-w-xl flex flex-col z-10 overflow-hidden"
            style={{
              height: "min(600px, calc(100vh - 100px))",
              background: "rgba(3,7,18,0.97)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 20,
              boxShadow: "0 28px 90px rgba(0,0,0,0.75), 0 0 50px rgba(16,185,129,0.07)",
              backdropFilter: "blur(28px)",
            }}
          >
            {/* Aurora glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.06]"
                style={{ background: "radial-gradient(circle, #10b981, transparent 70%)" }} />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-[0.04]"
                style={{ background: "radial-gradient(circle, #059669, transparent 70%)" }} />
            </div>

            {/* ── Header ── */}
            <div
              className="relative z-10 flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(16,185,129,0.1)", background: "rgba(0,0,0,0.3)" }}
            >
              <KindraAvatar size={34} glow />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">Kindra</span>
                  <span
                    className="flex items-center gap-1 text-[9px] font-bold text-emerald-400"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(16,185,129,0.22)",
                      borderRadius: 99,
                      padding: "1px 6px",
                    }}
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-white/30 truncate">KCF AI Support · Ask me anything</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {hasChat && (
                  <button
                    onClick={reset}
                    title="New chat"
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  title="Close"
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(16,185,129,0.15) transparent" }}
            >
              {messages.map(msg =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div
                      className="max-w-[83%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white leading-relaxed"
                      style={{
                        background: "linear-gradient(135deg, #059669, #10b981)",
                        boxShadow: "0 3px 14px rgba(16,185,129,0.22)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex items-start gap-2.5 group">
                    <KindraAvatar size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide">Kindra</span>
                        <CopyBtn msgId={msg.id} text={msg.text} copied={copied} onCopy={copyMsg} />
                      </div>
                      <div
                        className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-white/80"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <BotMarkdown text={msg.text} />
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <KindraAvatar size={28} />
                  <div
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400/70"
                        style={{
                          animation: `kw-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
                          display: "inline-block",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Quick chips (before any user message) ── */}
            {!hasChat && (
              <div
                className="relative z-10 flex-shrink-0 px-4 pb-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
              >
                <p className="text-[9px] text-white/20 uppercase tracking-widest text-center py-2">
                  Quick questions
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {QUICK_CHIPS.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => send(chip.text)}
                      disabled={loading}
                      className="flex-shrink-0 flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 px-3 py-2 rounded-xl transition-all whitespace-nowrap disabled:opacity-30"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                    >
                      <span>{chip.emoji}</span>
                      <span>{chip.text.split(" ").slice(0, 4).join(" ")}…</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Input bar ── */}
            <div
              className="relative z-10 flex-shrink-0 px-4 pb-4 pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div
                className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  disabled={loading}
                  placeholder={listening ? "🎙️ Listening…" : "Ask me anything about KCF…"}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white/80 placeholder-white/25 disabled:opacity-40 min-w-0"
                />

                {/* Mic */}
                {hasVoice && (
                  <button
                    onClick={toggleVoice}
                    disabled={loading}
                    title={listening ? "Stop listening" : "Voice input"}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all disabled:opacity-30"
                    style={{
                      background: listening ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.05)",
                      border: listening
                        ? "1px solid rgba(16,185,129,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {listening
                      ? <MicOff className="w-3.5 h-3.5 text-emerald-400" />
                      : <Mic className="w-3.5 h-3.5 text-white/40" />
                    }
                  </button>
                )}

                {/* Send */}
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl disabled:opacity-25 transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {micError && (
                <p className="text-[11px] text-amber-400 mt-2 text-center leading-snug">{micError}</p>
              )}
              <p className="text-center text-[9px] mt-2 flex items-center justify-center gap-1 text-white/15">
                <Zap className="w-2.5 h-2.5" />
                Powered by KCF AI · Press <kbd className="mx-0.5 px-1 py-0.5 rounded text-[8px] font-mono" style={{ background: "rgba(255,255,255,0.08)" }}>Enter</kbd> to send · <kbd className="mx-0.5 px-1 py-0.5 rounded text-[8px] font-mono" style={{ background: "rgba(255,255,255,0.08)" }}>Esc</kbd> to close
              </p>
            </div>

            {/* Typing animation keyframes */}
            <style>{`
              @keyframes kw-dot {
                0%,60%,100% { transform:translateY(0); }
                30%          { transform:translateY(-5px); }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
