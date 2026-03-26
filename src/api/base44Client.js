/**
 * base44Client.js — Supabase compatibility shim
 *
 * Exposes the same `base44` object shape the rest of the codebase uses,
 * powered entirely by Supabase.  No imports in components/pages need to change.
 */

import { supabase } from './supabaseClient';

// ── Table name map ────────────────────────────────────────────────────────────
const TABLE_MAP = {
  Analytics:           'analytics',
  ChatGroup:           'chat_groups',
  CommunityStory:      'community_stories',
  Donation:            'donations',
  GivingGoal:          'giving_goals',
  MessageAttachment:   'message_attachments',
  Notification:        'notifications',
  SocialComment:       'social_comments',
  SocialPost:          'social_posts',
  Subscription:        'subscriptions',
  TaskAttachment:      'task_attachments',
  TeamAnnouncement:    'team_announcements',
  TeamDocument:        'team_documents',
  TeamMember:          'team_members',
  TeamMessage:         'team_messages',
  TeamTask:            'team_tasks',
  User:                'profiles',
  VolunteerBadge:      'volunteer_badges',
  VolunteerHours:      'volunteer_hours',
  VolunteerSignup:     'volunteer_signups',
  VolunteerSubmission: 'volunteer_submissions',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyFilter(query, filter) {
  if (!filter || typeof filter !== 'object') return query;
  for (const [key, val] of Object.entries(filter)) {
    if (val && typeof val === 'object' && val.$regex) {
      query = query.ilike(key, `%${val.$regex}%`);
    } else {
      query = query.eq(key, val);
    }
  }
  return query;
}

function applySort(query, sort) {
  if (!sort) return query.order('created_at', { ascending: false });
  const field = sort.startsWith('-') ? sort.slice(1) : sort;
  const ascending = !sort.startsWith('-');
  const colMap = { created_date: 'created_at', updated_date: 'updated_at' };
  const col = colMap[field] || field;
  return query.order(col, { ascending });
}

// ── Entity factory ────────────────────────────────────────────────────────────
function createEntity(tableName) {
  return {
    async list(sort, limit) {
      let q = supabase.from(tableName).select('*');
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async filter(filter, sort, limit) {
      let q = supabase.from(tableName).select('*');
      q = applyFilter(q, filter);
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async create(data) {
      const { data: row, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return row;
    },

    async update(id, data) {
      const payload = { ...data };
      // Only add updated_at if the table likely has it (suppress for immutable tables)
      const noUpdatedAt = ['analytics', 'donations', 'community_stories', 'volunteer_hours',
        'volunteer_badges', 'volunteer_signups', 'volunteer_submissions', 'social_comments',
        'message_attachments', 'task_attachments'];
      if (!noUpdatedAt.includes(tableName)) {
        payload.updated_at = new Date().toISOString();
      }
      const { data: row, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return row;
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    },

    subscribe(callback) {
      const channel = supabase
        .channel(`${tableName}_changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
        .subscribe();
      return () => supabase.removeChannel(channel);
    },
  };
}

const entities = Object.fromEntries(
  Object.entries(TABLE_MAP).map(([name, table]) => [name, createEntity(table)])
);

// ── Auth ──────────────────────────────────────────────────────────────────────
const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
      role: profile?.role || 'member',
      avatar_url: profile?.avatar_url,
      ...profile,
    };
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  redirectToLogin(redirectUrl) {
    if (redirectUrl) sessionStorage.setItem('auth_redirect', redirectUrl);
    window.location.href = '/Login';
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    window.location.href = redirectUrl || '/';
  },
};

// ── Integrations ──────────────────────────────────────────────────────────────
const integrations = {
  Core: {
    async InvokeLLM({ prompt, response_json_schema } = {}) {
      // Use OpenAI if API key is configured in Netlify env vars
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (openaiKey) {
        try {
          const resp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 500,
            }),
          });
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) return response_json_schema ? {} : { result: text };
        } catch { /* fall through to context-based responses */ }
      }

      if (response_json_schema) return {};

      // KCF context-based fallback responses
      const p = (prompt || '').toLowerCase();
      if (p.includes('initiative') || p.includes('program')) {
        return { result: 'KCF has 6 key initiatives: (1) Volunteer Network — sign up, log hours, earn badges; (2) KindnessConnect — giving plans from $5/mo, roundups, 15% cashback; (3) Community Stories; (4) Team Portal (Synergy Hub); (5) Analytics Dashboard; and (6) Governance framework.' };
      }
      if (p.includes('volunteer') || p.includes('badge') || p.includes('hours')) {
        return { result: 'You can volunteer through KCF by signing up for initiatives and logging hours. Earn badges: First Steps (5hrs), Champion (25hrs), Leader (50hrs), Ambassador (100hrs), Lifetime (250hrs)! Sign up at kindness-community-ai.netlify.app/KindnessConnect.' };
      }
      if (p.includes('donat') || p.includes('giving') || p.includes('kindnessconnect')) {
        return { result: 'KindnessConnect is KCF\'s giving platform. Options include: Giving Plans from $5/month, Micro-Donation Roundups (card roundups), and Conscious Shopping Cashback up to 15%. Causes: Hunger, Climate, Clean Water, Education, Health, Ocean Conservation.' };
      }
      if (p.includes('kcf') || p.includes('kindness community') || p.includes('foundation') || p.includes('what is')) {
        return { result: 'Kindness Community Foundation (KCF) is a California nonprofit founded by our Founder. Our mission is community stabilization through ethical, technology-assisted volunteer networks. Our pillars: Education, Economic Empowerment, Health & Wellness, Community Development, Environmental Sustainability, and Cultural Preservation.' };
      }
      if (p.includes('founder')) {
        return { result: 'KCF was founded by our Founder, who built this nonprofit to promote community stabilization, ethical participation, and technology-assisted coordination of volunteer networks.' };
      }
      if (p.includes('contact') || p.includes('reach') || p.includes('email')) {
        return { result: 'Reach KCF at contact@kindnesscommunityfoundation.com. We\'re based in Newport Beach, California, USA.' };
      }
      if (p.includes('social wall') || p.includes('post') || p.includes('feed')) {
        return { result: 'The Social Wall is your team\'s community feed inside the Synergy Hub. You can post updates, share achievements, and engage with teammates. Head to Social Wall in the left navigation to get started!' };
      }
      if (p.includes('serviceconnect') || p.includes('freeapp') || p.includes('kindwave')) {
        return { result: 'KCF\'s tech products include: KindWave App (community kindness app), ServiceConnectPro.ai (AI-powered service connection), and FreeAppMaker.ai (build apps for free). All are part of KCF\'s mission to use technology for community good.' };
      }

      return { result: 'I\'m the KCF AI Assistant! I can help with questions about Kindness Community Foundation, our volunteer programs, giving initiatives, and more. For full AI capabilities, add a VITE_OPENAI_API_KEY in your Netlify environment variables. What would you like to know about KCF?' };
    },

    async UploadFile({ file }) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(path);
      return { url: data.publicUrl, file_url: data.publicUrl };
    },
  },
};

// ── Functions (Supabase Edge Functions) ───────────────────────────────────────
const functions = {
  async invoke(name, payload) {
    const { data, error } = await supabase.functions.invoke(name, { body: payload });
    if (error) throw error;
    return data;
  },
};

// ── App Logs (no-op) ──────────────────────────────────────────────────────────
const appLogs = { logUserInApp: () => Promise.resolve() };

// ── Export ────────────────────────────────────────────────────────────────────
export const base44 = { auth, entities, integrations, functions, appLogs };
