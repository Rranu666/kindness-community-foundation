// Speech-to-text hook using the Web Speech API (SpeechRecognition)
// Returns recording state, transcript, and feedback for pronunciation practice

const LANG_CODES = {
  spanish: 'es-ES',
  french: 'fr-FR',
  german: 'de-DE',
  japanese: 'ja-JP',
  korean: 'ko-KR',
  italian: 'it-IT',
  portuguese: 'pt-BR',
  mandarin: 'zh-CN',
};

// Normalize text for loose comparison
// Keeps CJK, Hangul, Hiragana, Katakana intact; strips accents from Latin
function normalize(str) {
  const hasCJK = /[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/.test(str);
  if (hasCJK) {
    return str.trim().toLowerCase();
  }
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Score how similar two strings are (simple character overlap ratio)
function similarityScore(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (!na || !nb) return 0;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  let matches = 0;
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;
  for (const ch of shorter) {
    if (longer.includes(ch)) matches++;
  }
  return matches / longer.length;
}

export function useSpeechRecognition(langId) {
  // Guard against 'undefined' / 'null' strings passed from URL params
  const safeLangId = (langId && langId !== 'undefined' && langId !== 'null') ? langId : 'spanish';
  const langCode = LANG_CODES[safeLangId] || 'en-US';

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  let activeRec = null;

  const stopListening = () => {
    if (activeRec) {
      try { activeRec.stop(); } catch (_) {}
      activeRec = null;
    }
  };

  const listen = (targetWord) => {
    return new Promise((resolve) => {
      if (!isSupported) {
        resolve({ success: false, transcript: '', feedback: 'not_supported' });
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      activeRec = rec;
      rec.lang = langCode;
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      rec.continuous = false;

      // Use a flag so we only resolve once (onend can fire after onerror)
      let resolved = false;
      const resolveOnce = (value) => {
        if (resolved) return;
        resolved = true;
        activeRec = null;
        resolve(value);
      };

      rec.onresult = (e) => {
        const alternatives = Array.from(e.results[0]);
        const transcripts = alternatives.map((alt) => alt.transcript.trim());
        const bestTranscript = transcripts[0] || '';
        const scores = transcripts.map((t) => similarityScore(t, targetWord));
        const bestScore = Math.max(...scores);

        let feedback;
        if (bestScore >= 0.85) feedback = 'great';
        else if (bestScore >= 0.55) feedback = 'close';
        else feedback = 'try_again';

        resolveOnce({ success: bestScore >= 0.55, transcript: bestTranscript, feedback, score: bestScore });
      };

      rec.onerror = (e) => {
        if (e.error === 'no-speech') {
          resolveOnce({ success: false, transcript: '', feedback: 'no_speech' });
        } else if (e.error === 'aborted') {
          resolveOnce({ success: false, transcript: '', feedback: 'cancelled' });
        } else if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          resolveOnce({ success: false, transcript: '', feedback: 'not_allowed' });
        } else if (e.error === 'audio-capture') {
          resolveOnce({ success: false, transcript: '', feedback: 'no_mic' });
        } else if (e.error === 'network') {
          resolveOnce({ success: false, transcript: '', feedback: 'network_error' });
        } else {
          resolveOnce({ success: false, transcript: '', feedback: 'error' });
        }
      };

      // Safety net: if onend fires without onresult or onerror (browser quirk),
      // resolve as no_speech so the UI never hangs in "listening" state
      rec.onend = () => {
        resolveOnce({ success: false, transcript: '', feedback: 'no_speech' });
      };

      try {
        rec.start();
      } catch (err) {
        resolveOnce({ success: false, transcript: '', feedback: 'error' });
        return;
      }

      // Safety timeout after 8s
      setTimeout(() => {
        try { if (activeRec) { activeRec.stop(); } } catch (_) {}
        resolveOnce({ success: false, transcript: '', feedback: 'no_speech' });
      }, 8000);
    });
  };

  return { listen, stopListening, isSupported };
}
