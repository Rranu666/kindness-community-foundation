import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsCard({ label, value, icon: Icon, trend, trendLabel, color = 'blue' }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', val: 'text-purple-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', val: 'text-orange-700' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={cn('text-2xl font-bold mt-1', c.val)}>{value ?? '—'}</p>
        {trendLabel && (
          <div className={cn('flex items-center gap-1 mt-1.5 text-xs', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendLabel}
          </div>
        )}
      </div>
      {Icon && (
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', c.bg)}>
          <Icon size={20} className={c.icon} />
        </div>
      )}
    </div>
  );
}
