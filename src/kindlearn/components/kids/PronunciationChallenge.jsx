import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, SkipForward } from 'lucide-react';
import { useSpeechRecognition } from '@/kindlearn/hooks/useSpeechRecognition';

function ConfettiBurst() {
  useEffect(() => {
    import('canvas-confetti').then((mod) => {
      mod.default({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#8b5cf6', '#ec4899', '#f59e0b'] });
    });
  }, []);
  return null;
}

const FEEDBACK_CONFIG = {
  great: {
    emoji: '🌟',
    title: 'Perfect!',
    message: 'Amazing pronunciation!',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-300',
  },
  close: {
    emoji: '👍',
    title: 'Good try!',
    message: 'Almost there, keep it up!',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-300',
  },
  try_again: {
    emoji: '💪',
    title: 'Try again!',
    message: "You'll get it next time!",
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-300',
  },
  no_speech: {
    emoji: '🤫',
    title: 'Nothing heard',
    message: 'Speak a little louder and try again!',
    color: 'text-muted-foreground',
    bg: 'bg-muted border-border',
  },
  not_allowed: {
    emoji: '🎤',
    title: 'Mic blocked',
    message: 'Allow microphone access in your browser settings, then try again.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-300',
  },
  no_mic: {
    emoji: '🎤',
    title: 'No microphone found',
    message: 'Connect a microphone and try again, or tap Skip.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-300',
  },
  network_error: {
    emoji: '🌐',
    title: 'Connection issue',
    message: 'Check your internet connection and try again.',
    color: 'text-muted-foreground',
    bg: 'bg-muted border-border',
  },
  cancelled: {
    emoji: '↩️',
    title: 'Cancelled',
    message: 'Tap the mic when you are ready to try!',
    color: 'text-muted-foreground',
    bg: 'bg-muted border-border',
  },
  error: {
    emoji: '😅',
    title: 'Could not record',
    message: 'Make sure your browser has mic permission, then try again.',
    color: 'text-muted-foreground',
    bg: 'bg-muted border-border',
  },
};

export default function PronunciationChallenge({ word, langId, onSpeak, onDone }) {
  const { listen, isSupported } = useSpeechRecognition(langId);
  const [phase, setPhase] = useState('idle'); // idle | listening | result
  const [result, setResult] = useState(null);

  const handleRecord = async () => {
    if (phase === 'listening') return;
    setPhase('listening');
    setResult(null);

    const res = await listen(word);
    setResult(res);
    setPhase('result');
  };

  const handleRetry = () => {
    setPhase('idle');
    setResult(null);
  };

  const feedback = result ? (FEEDBACK_CONFIG[result.feedback] || FEEDBACK_CONFIG.error) : null;

  if (!isSupported) {
    return (
      <div className="mt-4 text-center">
        <p className="font-fredoka text-xs text-muted-foreground">🎤 Mic practice not supported in this browser</p>
        <button onClick={onDone} className="mt-2 font-fredoka text-sm text-violet-500 underline">
          Skip →
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <p className="font-fredoka text-sm font-semibold text-violet-600 mb-3">🎤 Now you say it!</p>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleRecord}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200"
              aria-label="Start recording"
            >
              <Mic className="w-9 h-9 text-white" />
            </motion.button>
            <p className="font-fredoka text-xs text-muted-foreground">Tap the mic and say the word!</p>
            <button onClick={onDone} className="font-fredoka text-xs text-muted-foreground hover:text-violet-500 flex items-center gap-1 transition-colors">
              <SkipForward className="w-3 h-3" /> Skip
            </button>
          </motion.div>
        )}

        {phase === 'listening' && (
          <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-300"
            >
              <MicOff className="w-9 h-9 text-white" />
            </motion.div>
            <motion.div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1.5 h-8 bg-pink-400 rounded-full"
                />
              ))}
            </motion.div>
            <p className="font-fredoka text-sm font-semibold text-pink-500">Listening… 🎧</p>
          </motion.div>
        )}

        {phase === 'result' && feedback && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
            {result?.feedback === 'great' && <ConfettiBurst />}
            <div className={`w-full rounded-2xl border-2 p-4 text-center ${feedback.bg}`}>
              <motion.span
                initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="text-4xl block mb-1"
              >
                {feedback.emoji}
              </motion.span>
              <p className={`font-fredoka text-lg font-bold ${feedback.color}`}>{feedback.title}</p>
              <p className="font-fredoka text-sm text-muted-foreground">{feedback.message}</p>
              {result.score > 0 && (
                <div className="mt-2">
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${result.feedback === 'great' ? 'bg-emerald-500' : result.feedback === 'close' ? 'bg-amber-400' : 'bg-rose-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((result.score || 0) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="font-fredoka text-xs text-muted-foreground mt-1">{Math.round((result.score || 0) * 100)}% accuracy</p>
                </div>
              )}
              {result.transcript ? (
                <p className="font-fredoka text-xs text-muted-foreground mt-1">You said: <em>"{result.transcript}"</em></p>
              ) : null}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 bg-white border-2 border-violet-200 text-violet-600 font-fredoka font-semibold text-sm rounded-2xl px-4 py-2 hover:bg-violet-50 transition-all"
              >
                <Mic className="w-4 h-4" /> Try again
              </button>
              <button
                onClick={() => { onSpeak(); }}
                className="flex items-center gap-1.5 bg-white border-2 border-pink-200 text-pink-600 font-fredoka font-semibold text-sm rounded-2xl px-4 py-2 hover:bg-pink-50 transition-all"
              >
                <Volume2 className="w-4 h-4" /> Hear it
              </button>
              <button
                onClick={onDone}
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-fredoka font-semibold text-sm rounded-2xl px-4 py-2 shadow transition-all"
              >
                Next <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}