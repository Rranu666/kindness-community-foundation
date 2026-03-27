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

      // ── KCF comprehensive context-based responses ────────────────────────────
      // Extract only the user's question for matching — the full prompt includes
      // SITE_CONTEXT which always contains "kcf", "foundation", etc., causing
      // every query to match the mission/about branch.
      const userQ = (prompt || '').match(/USER QUESTION:\s*(.+?)(?:\n|Answer in)/is)?.[1]?.trim()
        || (prompt || '');
      const p = userQ.toLowerCase();

      // Causes / Pillars / Focus areas
      if (p.includes('cause') || p.includes('pillar') || p.includes('focus area') || p.includes('support') || p.includes('area of work')) {
        return { result: 'KCF focuses on 6 pillars: Education, Economic Empowerment, Health & Wellness, Community Development, Environmental Sustainability, and Cultural Preservation. Our giving causes include Hunger & Food Security, Climate & Reforestation, Clean Water Access, Education & Children, Health & Medical Aid, and Ocean Conservation — supported via donations to partners like Feeding America, Water.org, and UNICEF.' };
      }
      // Initiatives / Programs
      if (p.includes('initiative') || p.includes('program') || p.includes('feature') || p.includes('offer') || p.includes('service')) {
        return { result: 'KCF has 6 key initiatives: (1) Volunteer Network — sign up, log hours, earn badges; (2) KindnessConnect — giving plans from $5/mo, roundups, 15% cashback; (3) Community Stories — share impact across pillars; (4) Team Portal (Synergy Hub) — internal workspace; (5) Analytics Dashboard — track activity; and (6) Governance — transparent 12-traditions framework.' };
      }
      // Volunteer / Badge / Hours
      if (p.includes('volunteer') || p.includes('badge') || p.includes('hours') || p.includes('sign up') || p.includes('log hour')) {
        return { result: 'Volunteer with KCF by signing up for initiatives and logging your hours. Earn recognition badges: First Steps (5 hrs), Champion (25 hrs), Leader (50 hrs), Ambassador (100 hrs), and Lifetime (250 hrs). Your dashboard tracks total hours, badges earned, and active signups.' };
      }
      // Donations / KindnessConnect / Giving / Cashback / Roundup
      if (p.includes('donat') || p.includes('giving') || p.includes('kindnessconnect') || p.includes('cashback') || p.includes('roundup') || p.includes('how to give') || p.includes('contribute') || p.includes('fund')) {
        return { result: 'KindnessConnect is KCF\'s giving platform with three options: Giving Plans (recurring monthly from $5), Micro-Donation Roundups (automatic card purchase roundups), and Conscious Shopping Cashback (up to 15% cashback donated). Platform fee is 5% for plans/roundups and 0% for cashback. Causes: Hunger, Climate, Clean Water, Education, Health & Medical, and Ocean Conservation.' };
      }
      // Fees / Cost / Platform fee
      if (p.includes('fee') || p.includes('cost') || p.includes('charge') || p.includes('free') || p.includes('percent') || p.includes('%')) {
        return { result: 'KCF charges a 5% platform fee on Giving Plans and Micro-Donation Roundups to keep the platform running. Conscious Shopping Cashback donations have 0% platform fee — every cent of your cashback goes directly to your chosen cause.' };
      }
      // Partner charities
      if (p.includes('partner') || p.includes('charit') || p.includes('feeding america') || p.includes('water.org') || p.includes('unicef') || p.includes('organization')) {
        return { result: 'KCF partners with trusted global charities: Feeding America (hunger), Water.org (clean water), Save the Children (education), One Tree Planted (climate & reforestation), Ocean Conservancy (ocean health), and UNICEF (children). Your giving is directed to these verified partners based on your chosen cause.' };
      }
      // Governance / Board / Constitution / Traditions
      if (p.includes('governance') || p.includes('board') || p.includes('constitution') || p.includes('tradition') || p.includes('transparent') || p.includes('policy') || p.includes('rule')) {
        return { result: 'KCF operates under a transparent governance framework guided by 12 traditions — our Kindness Constitution. This ensures ethical participation, clear accountability, and community-centered decision making. Board recruitment is open; visit the Board Recruitment section on our website to learn about joining.' };
      }
      // Community Stories
      if (p.includes('stor') || p.includes('community stor') || p.includes('share') || p.includes('impact')) {
        return { result: 'Community Stories is KCF\'s platform for sharing real-world impact across our 6 pillars. Members and volunteers can post stories about education, health, environment, and more. These stories inspire others and showcase the foundation\'s reach across communities.' };
      }
      // Team Portal / Synergy Hub
      if (p.includes('team portal') || p.includes('synergy') || p.includes('hub') || p.includes('workspace') || p.includes('internal') || p.includes('portal')) {
        return { result: 'The Team Portal (Synergy Hub) is KCF\'s internal workspace for staff and volunteers. It includes messaging, task management, announcements, document sharing, an AI assistant, and a Social Wall for community updates — all in one place.' };
      }
      // Social Wall
      if (p.includes('social wall') || p.includes('post') || p.includes('feed') || p.includes('update')) {
        return { result: 'The Social Wall is the community feed inside the Synergy Hub. Post updates, share achievements, and engage with teammates. Find it in the left navigation of the Team Portal.' };
      }
      // Analytics
      if (p.includes('analytic') || p.includes('dashboard') || p.includes('stat') || p.includes('track') || p.includes('metric') || p.includes('report')) {
        return { result: 'KCF\'s Analytics Dashboard lets you track volunteer signups, logged hours, donations received, community stories posted, and overall platform activity — giving full visibility into KCF\'s impact in real time.' };
      }
      // Tech products / Apps
      if (p.includes('serviceconnect') || p.includes('freeapp') || p.includes('kindwave') || p.includes('app') || p.includes('product') || p.includes('technology') || p.includes('tech')) {
        return { result: 'KCF\'s technology products include: KindWave App (community kindness & connection app), ServiceConnectPro.ai (AI-powered service coordination), and FreeAppMaker.ai (build no-code apps for free). These tools are part of KCF\'s mission to harness technology for community good.' };
      }
      // KindnessScore / Milestones
      if (p.includes('score') || p.includes('milestone') || p.includes('kindness score') || p.includes('point') || p.includes('reward')) {
        return { result: 'KCF\'s Kindness Score tracks your cumulative giving and volunteering impact. Reach milestones to unlock recognition and become part of the Community Giving Circles — groups of like-minded donors coordinating impact together.' };
      }
      // Founder
      if (p.includes('founder') || p.includes('who started') || p.includes('who created') || p.includes('who built') || p.includes('established')) {
        return { result: 'KCF was founded by our Founder, who built this nonprofit to promote community stabilization, ethical participation, and technology-assisted coordination of volunteer networks in California and beyond.' };
      }
      // Location / Where
      if (p.includes('location') || p.includes('where') || p.includes('based') || p.includes('address') || p.includes('california') || p.includes('newport')) {
        return { result: 'KCF is based in Newport Beach, California, USA. While our roots are in California, our mission and volunteer network extend to communities across the country and beyond.' };
      }
      // Contact / Email / Reach
      if (p.includes('contact') || p.includes('reach') || p.includes('email') || p.includes('get in touch') || p.includes('message')) {
        return { result: 'Reach KCF at contact@kindnesscommunityfoundation.com. You can also visit kindness-community-ai.netlify.app or reach us through the contact form on our website. We\'re based in Newport Beach, California.' };
      }
      // Mission / Vision / About / What is KCF
      if (p.includes('mission') || p.includes('vision') || p.includes('about') || p.includes('kcf') || p.includes('kindness community') || p.includes('foundation') || p.includes('what is') || p.includes('who are')) {
        return { result: 'Kindness Community Foundation (KCF) is a California nonprofit dedicated to community stabilization through ethical, technology-assisted volunteer networks, transparent governance, and sustainable infrastructure. Our 6 pillars are: Education, Economic Empowerment, Health & Wellness, Community Development, Environmental Sustainability, and Cultural Preservation.' };
      }
      // Membership / Join / How to join
      if (p.includes('join') || p.includes('member') || p.includes('sign up') || p.includes('register') || p.includes('become')) {
        return { result: 'Join KCF by creating an account on our website. Once registered, you can sign up as a volunteer, set up a giving plan through KindnessConnect, share community stories, and access the Team Portal. We welcome anyone passionate about community kindness!' };
      }

      // Generic helpful fallback — never show API key instructions to users
      console.warn('[base44] InvokeLLM: no pattern matched. For AI-quality responses, set VITE_OPENAI_API_KEY.');
      return { result: 'I\'m the KCF AI Assistant! I can answer questions about KCF\'s mission, volunteer programs, giving initiatives, community stories, governance, and more. Try asking about our causes, how to volunteer, or how KindnessConnect works!' };
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
