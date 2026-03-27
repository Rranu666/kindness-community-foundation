import { useMemo } from 'react';
import { Users, DollarSign, Clock, BookOpen } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useProfiles } from '@/hooks/useProfiles';
import { useDonations } from '@/hooks/useDonations';
import { useVolunteerHours } from '@/hooks/useVolunteer';
import { useCommunityStories, useUpdateStory } from '@/hooks/useCommunityStories';
import { useUserGrowth, useDonationTrend } from '@/hooks/useAnalytics';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: profiles = [] } = useProfiles();
  const { data: donations = [] } = useDonations();
  const { data: hours = [] } = useVolunteerHours();
  const { data: stories = [] } = useCommunityStories();
  const { data: userGrowth = [] } = useUserGrowth(30);
  const { data: donationTrend = [] } = useDonationTrend(30);
  const updateStory = useUpdateStory();

  const totalDonations = useMemo(() => donations.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0), [donations]);
  const totalHours = useMemo(() => hours.reduce((s, h) => s + (parseFloat(h.hours) || 0), 0), [hours]);
  const pending = useMemo(() => stories.filter(s => s.status === 'pending'), [stories]);

  const recentActivity = useMemo(() => {
    const acts = [
      ...donations.slice(0, 5).map(d => ({ type: 'donation', text: `${d.user_email || 'Someone'} donated $${d.amount}`, date: d.created_at })),
      ...stories.slice(0, 5).map(s => ({ type: 'story', text: `New story: "${s.title?.slice(0, 40)}"`, date: s.created_at })),
    ];
    return acts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  }, [donations, stories]);

  const handleApprove = async (id) => {
    await updateStory.mutateAsync({ id, updates: { status: 'approved' } });
    toast.success('Story approved');
  };

  const handleReject = async (id) => {
    await updateStory.mutateAsync({ id, updates: { status: 'rejected' } });
    toast.success('Story rejected');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of your website activity" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Users" value={profiles.length} icon={Users} color="blue" />
        <StatsCard label="Total Donations" value={`$${totalDonations.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} icon={DollarSign} color="green" />
        <StatsCard label="Volunteer Hours" value={`${totalHours.toFixed(0)}h`} icon={Clock} color="purple" />
        <StatsCard label="Pending Stories" value={pending.length} icon={BookOpen} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Users (Last 30 Days)</h3>
          {userGrowth.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#eff6ff" name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Donations (Last 30 Days)</h3>
          {donationTrend.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={donationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`$${v}`, 'Amount']} />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((act, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg">{act.type === 'donation' ? '💚' : '📖'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{act.text}</p>
                    <p className="text-xs text-gray-400">{act.date ? format(new Date(act.date), 'MMM d, h:mm a') : ''}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Pending Story Approvals {pending.length > 0 && <span className="ml-1 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">{pending.length}</span>}</h3>
          {pending.length === 0 ? (
            <p className="text-gray-400 text-sm">All caught up! ✅</p>
          ) : (
            <ul className="space-y-3">
              {pending.slice(0, 5).map(s => (
                <li key={s.id} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-400">{s.author_name || s.author_email || 'Unknown'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleApprove(s.id)} className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1 rounded-lg font-medium">Approve</button>
                    <button onClick={() => handleReject(s.id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded-lg font-medium">Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
