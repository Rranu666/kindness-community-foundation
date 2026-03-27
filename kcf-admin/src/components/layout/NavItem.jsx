import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function NavItem({ href, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
          isActive && 'bg-sidebar-accent text-white',
          collapsed && 'justify-center px-2'
        )
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
