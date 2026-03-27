import { useState } from 'react';
import { Users, DollarSign, Clock, FileText } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useProfiles } from '@/hooks/useProfiles';
import { useDonations } from '@/hooks/useDonations';
import { useVolunteerHours } from '@/hooks/useVolunteer';
import { useCommunityStories } from '@/hooks/useCommunityStories';
import { useUserGrowth, useDonationTrend, useDonationsByCause, useVolunteerByInitiative } from '@/hooks/useAnalytics';

const DAYS_OPTIONS = [7, 30, 90];
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const [days, setDays] = useState(30);
  const { data: profiles = [] } = useProfiles();
  const { data: donations = [] } = useDonations();
  const { data: hours = [] } = useVolunteerHours();
  const { data: stories = [] } = useCommunityStories();
  const { data: userGrowth = [], isLoading: lgLoading } = useUserGrowth(days);
  const { data: donationTrend = [], isLoading: dtLoading } = useDonationTrend(days);
  const { data: byCause = [] } = useDonationsByCause();
  const { data: byInit = [] } = useVolunteerByInitiative();

  const totalDonations = donations.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
  const totalHours = hours.reduce((s, h) => s + (parseFloat(h.hours) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Analytics" subtitle="Platform-wide performance metrics" />
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {DAYS_OPTIONS.map(d => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${days === d ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Users" value={profiles.length} icon={Users} color="blue" />
        <StatsCard label="Total Donations" value={`$${totalDonations.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon={DollarSign} color="green" />
        <StatsCard label="Volunteer Hours" value={`${totalHours.toFixed(0)}h`} icon={Clock} color="purple" />
        <StatsCard label="Community Stories" value={stories.length} icon={FileText} color="orange" />
      </div>

      {/* Line charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">User Growth (Last {days} Days)</h3>
          {lgLoading ? <LoadingSpinner /> : userGrowth.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#eff6ff" name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Donations (Last {days} Days)</h3>
          {dtLoading ? <LoadingSpinner /> : donationTrend.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={donationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${v}`, 'Amount']} />
                <Area type="monotone" dataKey="total" stroke="#10b981" fill="#f0fdf4" name="Amount ($)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Donations by Cause</h3>
          {byCause.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No donation data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCause} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {byCause.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`$${v}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Volunteer Hours by Initiative</h3>
          {byInit.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No volunteer data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byInit} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={v => [`${v}h`, 'Hours']} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Story breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Community Stories Status</h3>
        <div className="flex gap-6">
          {['pending', 'approved', 'rejected'].map(s => {
            const count = stories.filter(st => st.status === s).length;
            const pct = stories.length ? Math.round((count / stories.length) * 100) : 0;
            return (
              <div key={s} className="flex-1 text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500 capitalize">{s}</p>
                <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
