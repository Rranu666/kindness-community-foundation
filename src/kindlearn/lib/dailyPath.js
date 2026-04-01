/**
 * Daily Path recommendation engine.
 *
 * Inputs:
 *   - progress: UserProgress record (struggled_words, lessons_completed, current_day, xp_total, streak_days, words_learned)
 *   - srsData:  { [word]: { repetitions, nextReview, lastQuality, interval } }  (from localStorage)
 *   - langId:   string
 *
 * Output: Array of up to 4 PathItem objects sorted by priority.
 *
 * PathItem shape:
 * {
 *   id: string,
 *   type: 'lesson' | 'review' | 'flashcards' | 'listen',
 *   title: string,
 *   subtitle: string,
 *   reason: string,         // short human-readable why this is recommended
 *   priority: number,       // higher = more urgent (used for sort)
 *   urgency: 'high' | 'medium' | 'low',
 *   emoji: string,
 *   route: string,          // href / navigate target
 *   badge?: string,         // optional pill text e.g. "5 words due"
 * }
 */

import { FLASHCARD_DECK, getDueCards } from '@/kindlearn/lib/flashcards';

const TODAY = new Date().toISOString().split('T')[0];

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((new Date(TODAY) - new Date(dateStr)) / 86400000);
}

export function buildDailyPath(progress, srsData, langId) {
  const p = progress || {};
  const items = [];

  const struggled = p.struggled_words || {};
  const struggledCount = Object.keys(struggled).length;
  const topStruggled = Object.entries(struggled)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([w]) => w);

  const lessonsCompleted = p.lessons_completed || [];
  const currentDay = p.current_day || 1;
  const streak = p.streak_days || 0;
  const lastActivity = p.last_activity_date;
  const missedDays = daysSince(lastActivity);

  const fullDeck = FLASHCARD_DECK[langId] || [];
  const dueSRS = getDueCards(fullDeck, srsData);
  const dueCount = dueSRS.length;

  // --- Weak categories from SRS ---
  const categoryScores = {}; // category -> { total, bad }
  fullDeck.forEach((card) => {
    const d = srsData[card.word];
    if (!categoryScores[card.category]) categoryScores[card.category] = { total: 0, bad: 0 };
    categoryScores[card.category].total++;
    if (d && (d.lastQuality <= 2 || d.repetitions === 0)) {
      categoryScores[card.category].bad++;
    }
  });
  const weakCategories = Object.entries(categoryScores)
    .filter(([, s]) => s.total > 0 && s.bad / s.total >= 0.4)
    .map(([cat]) => cat);

  // ── 1. LESSON — always highest priority if not done today ────────────────
  const lessonDoneToday = lastActivity === TODAY && lessonsCompleted.includes(currentDay);
  if (!lessonDoneToday && currentDay <= 30) {
    let priority = 100;
    let urgency = 'medium';
    let reason = `Continue your Day ${currentDay} lesson`;

    if (missedDays >= 2) {
      priority = 130;
      urgency = 'high';
      reason = `You haven't practiced in ${missedDays} days — keep your streak alive!`;
    } else if (streak === 0) {
      priority = 120;
      urgency = 'high';
      reason = 'Start a new streak today!';
    }

    items.push({
      id: 'lesson',
      type: 'lesson',
      title: `Day ${currentDay} Lesson`,
      subtitle: `${30 - lessonsCompleted.length} lessons remaining`,
      reason,
      priority,
      urgency,
      emoji: '📚',
      route: `/kindlearn/lesson?lang=${langId}&day=${currentDay}`,
    });
  }

  // ── 2. REVIEW — struggled words ─────────────────────────────────────────
  if (struggledCount > 0) {
    const urgency = struggledCount >= 5 ? 'high' : struggledCount >= 2 ? 'medium' : 'low';
    const priority = urgency === 'high' ? 115 : urgency === 'medium' ? 85 : 60;
    items.push({
      id: 'review',
      type: 'review',
      title: 'Vocabulary Review',
      subtitle: topStruggled.join(', ') + (struggledCount > 3 ? ` +${struggledCount - 3} more` : ''),
      reason: `You've missed ${struggledCount} word${struggledCount > 1 ? 's' : ''} — practice makes perfect`,
      priority,
      urgency,
      emoji: '🧠',
      route: `/kindlearn/review?lang=${langId}`,
      badge: `${struggledCount} words`,
    });
  }

  // ── 3. FLASHCARDS — SRS due cards ───────────────────────────────────────
  if (dueCount > 0) {
    const urgency = dueCount >= 10 ? 'high' : dueCount >= 4 ? 'medium' : 'low';
    const priority = urgency === 'high' ? 110 : urgency === 'medium' ? 80 : 55;

    // Append weak category hint
    const catHint = weakCategories.length > 0
      ? `Focus on: ${weakCategories.slice(0, 2).join(', ')}`
      : `${dueCount} cards ready for review`;

    items.push({
      id: 'flashcards',
      type: 'flashcards',
      title: 'Flashcard Review',
      subtitle: catHint,
      reason: weakCategories.length > 0
        ? `Your ${weakCategories[0]} category needs attention`
        : `${dueCount} spaced-repetition cards are due today`,
      priority,
      urgency,
      emoji: '🃏',
      route: `/kindlearn/flashcards?lang=${langId}`,
      badge: `${dueCount} due`,
    });
  }

  // ── 4. LISTENING — always good if lesson done or low urgency ────────────
  const listenDoneToday = lastActivity === TODAY && (p.daily_practice_minutes || 0) > 5;
  const listenPriority = lessonDoneToday ? 70 : 45;
  if (items.length < 4 || listenPriority > 60) {
    items.push({
      id: 'listen',
      type: 'listen',
      title: 'Listening Game',
      subtitle: 'Audio comprehension practice',
      reason: 'Training your ear sharpens recognition speed',
      priority: listenPriority,
      urgency: 'low',
      emoji: '🎧',
      route: `/kindlearn/listen?lang=${langId}`,
    });
  }

  // ── 5. Bonus: Weak-category flashcard focus ──────────────────────────────
  if (weakCategories.length > 0 && items.length < 5) {
    const cat = weakCategories[0];
    items.push({
      id: `flashcards-${cat}`,
      type: 'flashcards',
      title: `${cat} Focus`,
      subtitle: `Targeted practice on weak spots`,
      reason: `You're scoring low on ${cat} — drill it now`,
      priority: 75,
      urgency: 'medium',
      emoji: '🎯',
      route: `/kindlearn/flashcards?lang=${langId}&cat=${cat}`,
      badge: cat,
    });
  }

  // Sort by priority desc, keep top 4
  return items
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);
}

/**
 * Returns a short motivational headline based on overall state.
 */
export function getDailyPathHeadline(progress, srsData, langId) {
  const p = progress || {};
  const streak = p.streak_days || 0;
  const missedDays = daysSince(p.last_activity_date);
  const struggled = Object.keys(p.struggled_words || {}).length;
  const dueCount = getDueCards(FLASHCARD_DECK[langId] || [], srsData).length;

  if (missedDays >= 2) return "Let's get back on track 💪";
  if (streak >= 7) return `${streak}-day streak! Keep it blazing 🔥`;
  if (struggled >= 5) return 'Some words need attention 🧠';
  if (dueCount >= 10) return 'Big flashcard queue today 🃏';
  if (streak >= 3) return `${streak} days strong! 🌟`;
  return "Here's your plan for today ✨";
}