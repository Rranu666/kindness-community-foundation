import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Send, Loader2, X, Plus, Zap, Heart, CheckCircle2, AlertCircle } from "lucide-react";

const PILLARS = [
  "Education",
  "Economic Empowerment",
  "Health & Wellness",
  "Community Development",
  "Environmental Sustainability",
  "Cultural Preservation",
];

const PILLAR_COLORS = {
  "Education": "bg-blue-100 text-blue-700",
  "Economic Empowerment": "bg-emerald-100 text-emerald-700",
  "Health & Wellness": "bg-rose-100 text-rose-700",
  "Community Development": "bg-amber-100 text-amber-700",
  "Environmental Sustainability": "bg-green-100 text-green-700",
  "Cultural Preservation": "bg-purple-100 text-purple-700",
};

export default function StorySubmitForm({ onSuccess }) {
  const [form, setForm] = useState({
    author_name: "",
    author_email: "",
    title: "",
    story: "",
    pillar: "",
    tags: [],
    location: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Real-time analysis on story change (with debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.story.length > 50) {
        setAnalysisLoading(true);
        try {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an expert narrative coach for community impact stories. Analyze this story draft:

"${form.story}"

Provide a JSON response with:
1. "emotional_score" (0-10): How emotionally resonant and impactful is this story?
2. "emotional_feedback" (string): Brief assessment of emotional depth and connection
3. "structure_feedback" (string): One key suggestion to improve narrative flow/structure
4. "length_feedback" (string): Is it too short, too long, or just right?
5. "impact_keywords" (array): 3-4 key words/phrases that drive impact
6. "next_prompt" (string): A specific question to help deepen the story further

Be encouraging and constructive.`,
            response_json_schema: {
              type: "object",
              properties: {
                emotional_score: { type: "number" },
                emotional_feedback: { type: "string" },
                structure_feedback: { type: "string" },
                length_feedback: { type: "string" },
                impact_keywords: { type: "array", items: { type: "string" } },
                next_prompt: { type: "string" },
              },
            },
          });
          setRealTimeAnalysis(result);
        } catch (err) {
          // silently ignore AI analysis failure
        } finally {
          setAnalysisLoading(false);
        }
      } else {
        setRealTimeAnalysis(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [form.story]);

  const addTag = (tag) => {
    const t = tag.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const handleAIAssist = async () => {
    if (!form.story && !form.title) return;
    setAiLoading(true);
    setAiSuggestions(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert community storyteller for Kindness Community — a nonprofit focused on education, economic empowerment, health & wellness, community development, environmental sustainability, and cultural preservation.

A user is writing a community impact story. Help them:
1. Dramatically improve their story draft while preserving their authentic voice — enhance emotional resonance and structure
2. Suggest the best mission pillar category
3. Suggest 3–5 highly relevant impact-focused tags
4. Add a brief "narrative strength" comment about what makes their story compelling

User's title: "${form.title}"
User's story draft: "${form.story}"

Your improved story should:
- Open with a hook that captures attention
- Show concrete, specific examples of impact
- End with a reflection or call to action
- Be 20-30% longer but stay authentic

Respond as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            improved_story: { type: "string" },
            suggested_pillar: { type: "string" },
            suggested_tags: { type: "array", items: { type: "string" } },
            narrative_strength: { type: "string" },
          },
        },
      });
      setAiSuggestions(result);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestions = () => {
    if (!aiSuggestions) return;
    setForm((f) => ({
      ...f,
      story: aiSuggestions.improved_story || f.story,
      pillar: aiSuggestions.suggested_pillar || f.pillar,
      tags: [
        ...new Set([...f.tags, ...(aiSuggestions.suggested_tags || [])]),
      ],
    }));
    setAiSuggestions(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.CommunityStory.create(form);
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const isAIReady = form.story.length > 30 || form.title.length > 5;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name & Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white mb-1">Your Name *</label>
          <input
            name="author_name"
            value={form.author_name}
            onChange={handleChange}
            required
            placeholder="Jane Doe"
            className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/3 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm text-white placeholder:text-white/25"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-1">Email *</label>
          <input
            name="author_email"
            type="email"
            value={form.author_email}
            onChange={handleChange}
            required
            placeholder="jane@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/3 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm text-white placeholder:text-white/25"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-white mb-1">Location</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="City, Country"
          className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/3 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm text-white placeholder:text-white/25"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-white mb-1">Story Title *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="How Kindness Community Changed My Life..."
          className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/3 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm text-white placeholder:text-white/25"
        />
      </div>

      {/* Story */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-semibold text-white">Your Story *</label>
          <button
            type="button"
            onClick={handleAIAssist}
            disabled={!isAIReady || aiLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-violet-400 hover:to-purple-400 transition-all"
          >
            {aiLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            Full Polish
          </button>
        </div>
        <textarea
          name="story"
          value={form.story}
          onChange={handleChange}
          required
          rows={6}
          placeholder="Share your experience with Kindness Community's initiatives. How did it impact you, your family, or your community?"
          className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/3 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm resize-none text-white placeholder:text-white/25"
        />
        <p className="text-xs text-white/35 mt-2">Start typing — we'll analyze in real-time and suggest improvements as you write.</p>
      </div>

      {/* Real-time Analysis Panel */}
      {realTimeAnalysis && (
        <div className="rounded-2xl p-5 border border-rose-500/15" style={{ background: "rgba(244,63,94,0.06)" }}>
          <div className="space-y-4">
            {/* Emotional Impact Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${realTimeAnalysis.emotional_score >= 7 ? "text-rose-400" : "text-white/30"}`} />
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Emotional Impact</span>
                </div>
                <span className="text-lg font-bold text-rose-400">{realTimeAnalysis.emotional_score}/10</span>
              </div>
              <p className="text-xs text-white/40">{realTimeAnalysis.emotional_feedback}</p>
            </div>

            {/* Structure & Flow */}
            <div className="border-t border-white/[0.05] pt-3">
              <div className="flex items-start gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wide">Structure</p>
                  <p className="text-xs text-white/40 mt-1">{realTimeAnalysis.structure_feedback}</p>
                </div>
              </div>
            </div>

            {/* Length & Pacing */}
            <div className="border-t border-white/[0.05] pt-3">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wide">Length & Pacing</p>
                  <p className="text-xs text-white/40 mt-1">{realTimeAnalysis.length_feedback}</p>
                </div>
              </div>
            </div>

            {/* Impact Keywords */}
            {realTimeAnalysis.impact_keywords?.length > 0 && (
              <div className="border-t border-white/[0.05] pt-3">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wide mb-2">Key Impact Phrases</p>
                <div className="flex flex-wrap gap-2">
                  {realTimeAnalysis.impact_keywords.map((kw) => (
                    <span key={kw} className="text-xs px-2 py-1 rounded-full bg-white/5 text-rose-300 border border-rose-500/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Next Prompt for Deepening */}
            {realTimeAnalysis.next_prompt && (
              <div className="border-t border-white/[0.05] pt-3">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wide mb-2">💡 Deepen Your Story</p>
                <p className="text-xs text-white/40 italic">"{realTimeAnalysis.next_prompt}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Polish Panel */}
      {aiSuggestions && (
        <div className="rounded-2xl p-5 border border-violet-500/20" style={{ background: "rgba(139,92,246,0.06)" }}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-violet-400 mb-3">
                <Sparkles className="w-4 h-4" /> Polish Complete
              </div>
              {aiSuggestions.narrative_strength && (
                <p className="text-xs text-white/40 italic mb-3 p-3 rounded-lg bg-white/3 border border-white/5">
                  "{aiSuggestions.narrative_strength}"
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">✨ Polished Story</p>
              <p className="text-sm text-white/60 leading-relaxed">{aiSuggestions.improved_story}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-3">
              <div>
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Category</p>
                <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/30 to-purple-500/30 text-violet-300 border border-violet-500/20">
                  {aiSuggestions.suggested_pillar}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {(aiSuggestions.suggested_tags || []).slice(0, 2).map((t) => (
                    <span key={t} className="text-xs px-2 py-1 rounded-full bg-white/5 text-violet-300 border border-violet-500/20">
                      #{t}
                    </span>
                  ))}
                  {(aiSuggestions.suggested_tags || []).length > 2 && (
                    <span className="text-xs px-2 py-1 text-white/40">+{(aiSuggestions.suggested_tags || []).length - 2} more</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={applyAISuggestions}
              className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all"
              style={{ background: "linear-gradient(135deg, #a78bfa, #c084fc)" }}
            >
              Accept All & Continue
            </button>
          </div>
        </div>
      )}

      {/* Pillar */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">Mission Pillar *</label>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setForm((f) => ({ ...f, pillar: p }))}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: form.pillar === p ? "linear-gradient(135deg, #f43f5e, #ec4899)" : "rgba(255,255,255,0.05)",
                borderColor: form.pillar === p ? "transparent" : "rgba(255,255,255,0.1)",
                color: form.pillar === p ? "white" : "rgba(255,255,255,0.5)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-rose-500/20" style={{ background: "rgba(244,63,94,0.1)", color: "#fca5a5" }}>
              #{t}
              <button type="button" onClick={() => removeTag(t)} className="hover:text-rose-300">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
            placeholder="Add a tag..."
            className="flex-1 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/3 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm text-white placeholder:text-white/25"
          />
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "rgba(244,63,94,0.15)", color: "#fca5a5" }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? "Submitting..." : "Share My Story"}
      </button>
    </form>
  );
}