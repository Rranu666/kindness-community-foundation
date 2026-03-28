import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SITE_CONTEXT = `
Kindness Community Foundation (KCF) is a California nonprofit building ethical, technology-assisted volunteer networks, transparent governance, and sustainable community infrastructure.

FOUNDER: KCF was founded by the Founder.

MISSION: Promoting community stabilization, ethical participation, and technology-assisted coordination of volunteer and contribution networks.

PILLARS / FOCUS AREAS: Education, Economic Empowerment, Health & Wellness, Community Development, Environmental Sustainability, Cultural Preservation.

INITIATIVES:
1. Volunteer Network – Structured volunteer programs with hours tracking, badges (First Steps 5hrs, Champion 25hrs, Leader 50hrs, Ambassador 100hrs, Lifetime 250hrs)
2. KindnessConnect – Web-based giving platform with Giving Plans (from $5/month), Micro-Donation Roundups (card roundups), Conscious Shopping Cashback (up to 15%), Live Impact Dashboard, Community Giving Circles, Kindness Score & Milestones
3. Community Stories – Platform to share stories across pillars
4. Team Portal (Synergy Hub) – Internal workspace with messaging, tasks, announcements, documents, AI assistant
5. Analytics Dashboard – Track volunteer signups, hours, donations, stories, platform activity
6. Governance – Transparent governance with 12 traditions / kindness constitution

GIVING / DONATIONS:
- Giving Plans: recurring monthly from $5
- Roundups: automatic card purchase roundups
- Cashback Shopping: up to 15% cashback donated
- Causes: Hunger & Food Security, Climate & Reforestation, Clean Water Access, Education & Children, Health & Medical Aid, Ocean Conservation
- Partner charities: Feeding America, Water.org, Save the Children, One Tree Planted, Ocean Conservancy, UNICEF
- Platform fee: 5% for Giving Plans/Roundups; 0% for Cashback

VOLUNTEER INFO:
- Sign up for initiatives, log hours, earn badges
- Dashboard shows total hours, badges earned, active signups

CONTACT: contact@kindnesscommunityfoundation.com
WEBSITE: kindnesscommunityfoundation.com
LOCATION: California, USA
`;

export default function SiteSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [micError, setMicError] = useState("");
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const micErrorTimerRef = useRef(null);

  useEffect(() => {
    setMicSupported("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setAnswer("");
      setMicError("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSearch = async (q) => {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true);
    setAnswer("");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a helpful assistant for the Kindness Community Foundation (KCF) website. Answer the user's question based on the following site information. Be concise, friendly, and accurate. If the question is not related to KCF or the site, politely redirect them.

SITE INFORMATION:
${SITE_CONTEXT}

USER QUESTION: ${text}

Answer in 2-4 sentences max. Be warm and use KCF's tone of kindness and community.`,
    });
    setAnswer(typeof res === "string" ? res : res?.result || res?.response || "Sorry, I couldn't find an answer. Please try rephrasing your question.");
    setLoading(false);
  };

  const showMicError = (msg) => {
    setMicError(msg);
    if (micErrorTimerRef.current) clearTimeout(micErrorTimerRef.current);
    micErrorTimerRef.current = setTimeout(() => setMicError(""), 4000);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showMicError("Voice search is not supported in this browser.");
      return;
    }
    setMicError("");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setListening(false);
      const errorMessages = {
        "not-allowed":        "Mic access denied — allow microphone in browser settings.",
        "permission-denied":  "Mic access denied — allow microphone in browser settings.",
        "no-speech":          "No speech detected — please try again.",
        "network":            "Network error — please check your connection.",
        "service-not-allowed":"Voice search is unavailable on this browser.",
        "audio-capture":      "No microphone found — please connect a mic.",
        "aborted":            "",  // user cancelled, no message needed
      };
      const msg = errorMessages[e.error] ?? "Voice search failed — please try typing instead.";
      if (msg) showMicError(msg);
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      showMicError("Could not start voice search — please try typing instead.");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const suggestions = [
    "How can I volunteer?",
    "How does KindnessConnect work?",
    "What causes does KCF support?",
    "Who founded KCF?",
    "How do I earn badges?",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0d1b2a]/70 backdrop-blur-sm" onClick={onClose} />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search anything about KCF…"
                className="flex-1 text-base text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
              <div className="flex items-center gap-2">
                {micSupported && (
                  <button
                    onClick={listening ? stopListening : startListening}
                    className={`p-2 rounded-full transition-all ${listening ? "bg-red-100 text-red-500 animate-pulse" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
                    title={listening ? "Stop listening" : "Search by voice"}
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                {query && (
                  <button onClick={() => { setQuery(""); setAnswer(""); }} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mic error banner */}
            {micError && (
              <div className="px-5 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-600 text-xs">
                <MicOff className="w-3.5 h-3.5 flex-shrink-0" />
                {micError}
              </div>
            )}

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Listening indicator */}
              {listening && (
                <div className="flex items-center justify-center gap-3 py-8 text-red-500">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="w-1 bg-red-400 rounded-full animate-bounce" style={{ height: `${16 + i * 6}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">Listening… speak now</span>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center gap-3 py-10 text-[#3D6B50]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Searching KCF knowledge…</span>
                </div>
              )}

              {/* Answer */}
              {answer && !loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6">
                  <div className="flex items-start gap-3 bg-[#EAF0EC] rounded-2xl p-5">
                    <div className="w-8 h-8 rounded-full bg-[#3D6B50] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#3D6B50] uppercase tracking-wider mb-2">KCF Assistant</p>
                      <p className="text-[#1B2B22] text-sm leading-relaxed">{answer}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setQuery(""); setAnswer(""); inputRef.current?.focus(); }}
                    className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ← Ask another question
                  </button>
                </motion.div>
              )}

              {/* Suggestions */}
              {!loading && !answer && !listening && (
                <div className="p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Suggested questions</p>
                  <div className="flex flex-col gap-1">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setQuery(s); handleSearch(s); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                      >
                        <Search className="w-4 h-4 text-slate-300 group-hover:text-[#3D6B50] transition-colors flex-shrink-0" />
                        <span className="text-sm text-slate-600 group-hover:text-[#1B2B22] transition-colors">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">Enter</kbd> to search · <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">Esc</kbd> to close</span>
              {micSupported && !micError && <span className="text-xs text-slate-400 flex items-center gap-1"><Mic className="w-3 h-3" /> Voice search available</span>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}