import {
  LayoutDashboard, Users, FileText, Search, Globe,
  Megaphone, BarChart2, Settings, Waves,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Users',      href: '/users',       icon: Users },
  { label: 'Content',    href: '/content',     icon: FileText },
  { label: 'KindWave',   href: '/kindwave',    icon: Waves },
  { label: 'SEO',        href: '/seo',         icon: Search },
  { label: 'Languages',  href: '/languages',   icon: Globe },
  { label: 'Marketing',  href: '/marketing',   icon: Megaphone },
  { label: 'Analytics',  href: '/analytics',   icon: BarChart2 },
  { label: 'Settings',   href: '/settings',    icon: Settings },
];

export const STATUS_COLORS = {
  published: 'bg-green-100 text-green-800',
  draft:      'bg-yellow-100 text-yellow-800',
  pending:    'bg-blue-100 text-blue-800',
  approved:   'bg-green-100 text-green-800',
  rejected:   'bg-red-100 text-red-800',
  active:     'bg-green-100 text-green-800',
  paused:     'bg-yellow-100 text-yellow-800',
  cancelled:  'bg-gray-100 text-gray-600',
  sent:       'bg-purple-100 text-purple-800',
  scheduled:  'bg-blue-100 text-blue-800',
  admin:      'bg-blue-100 text-blue-800',
  member:     'bg-gray-100 text-gray-600',
};
