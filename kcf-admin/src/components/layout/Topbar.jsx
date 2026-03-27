import { useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/lib/AuthContext';
import { LogOut, ExternalLink } from 'lucide-react';

export default function Topbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const current = NAV_ITEMS.find(n => pathname.startsWith(n.href));

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{current?.label || 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://kindnesscommunityfoundation.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ExternalLink size={13} />
          View Site
        </a>

        <div className="h-4 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <span className="text-sm text-gray-700 font-medium hidden sm:block">
            {user?.full_name || user?.email}
          </span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50"
          title="Sign out"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  );
}
