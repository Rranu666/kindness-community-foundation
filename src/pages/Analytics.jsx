import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import MetricsGrid from "@/components/analytics/MetricsGrid";
import ActivityChart from "@/components/analytics/ActivityChart";
import MetricBreakdown from "@/components/analytics/MetricBreakdown";
import TopMetrics from "@/components/analytics/TopMetrics";

export default function Analytics() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Fetch analytics data
  const { data: analyticsData = [] } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => base44.entities.Analytics.list(),
  });

  // Fetch users count
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Fetch volunteer hours
  const { data: volunteerHours = [] } = useQuery({
    queryKey: ['volunteerHours'],
    queryFn: () => base44.entities.VolunteerHours.list(),
  });

  // Fetch documents
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.TeamDocument.list(),
  });

  // Process metrics
  const totalUsers = users.length;
  const totalHours = volunteerHours.reduce((sum, h) => sum + (h.hours || 0), 0);
  const totalDocuments = documents.length;
  
  // Calculate growth rate (users added in last 7 days vs previous 7 days)
  const last7Days = analyticsData.filter(item => {
    const itemDate = new Date(item.metric_date);
    const sevenDaysAgo = subDays(new Date(), 7);
    return itemDate >= sevenDaysAgo;
  }).length;
  const prev7Days = analyticsData.filter(item => {
    const itemDate = new Date(item.metric_date);
    const fourteenDaysAgo = subDays(new Date(), 14);
    const sevenDaysAgo = subDays(new Date(), 7);
    return itemDate >= fourteenDaysAgo && itemDate < sevenDaysAgo;
  }).length;
  const growthRate = prev7Days > 0 ? ((last7Days - prev7Days) / prev7Days * 100) : 0;

  // Generate activity chart data (last 30 days)
  const generateActivityData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM dd');
      const dayAnalytics = analyticsData.filter(item => item.metric_date === format(date, 'yyyy-MM-dd'));
      
      data.push({
        date: dateStr,
        signups: dayAnalytics.filter(a => a.metric_type === 'user_signup').length,
        active: dayAnalytics.length
      });
    }
    return data;
  };

  // Generate metric breakdown data
  const generateBreakdownData = () => {
    const breakdown = {};
    analyticsData.forEach(item => {
      const type = item.metric_type.replace(/_/g, ' ').toUpperCase();
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
    return Object.entries(breakdown).map(([type, count]) => ({ type, count }));
  };

  // Generate top metrics
  const generateTopMetrics = () => {
    return [
      { label: 'New User Signups', description: 'Last 7 days', value: last7Days },
      { label: 'Volunteer Hours Logged', description: 'Total', value: totalHours.toFixed(0) },
      { label: 'Team Documents', description: 'All documents', value: totalDocuments },
      { label: 'Active Users', description: 'With recent activity', value: users.filter(u => u.updated_date).length },
      { label: 'Growth Rate', description: 'Week over week', value: `${growthRate.toFixed(1)}%` }
    ];
  };

  const activityData = generateActivityData();
  const breakdownData = generateBreakdownData();
  const topMetrics = generateTopMetrics();

  const metrics = {
    totalUsers,
    totalHours,
    totalDocuments,
    growthRate
  };

  // Auth guard
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
        <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#030712' }}>
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-3">Access Restricted</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            The Analytics Dashboard is only available to administrators.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: '#030712' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/50 text-sm md:text-base">Track platform growth and usage patterns</p>
        </div>

        {/* Key Metrics Grid */}
        <MetricsGrid metrics={metrics} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ActivityChart data={activityData} title="User Activity (Last 30 Days)" />
          </div>
          <div>
            <TopMetrics data={topMetrics} title="Key Metrics" />
          </div>
        </div>

        {/* Breakdown Chart */}
        <MetricBreakdown data={breakdownData} title="Activity Breakdown by Type" />
      </div>
    </div>
  );
}