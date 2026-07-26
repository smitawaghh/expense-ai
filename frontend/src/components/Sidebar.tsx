import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-config';
import { useAuth } from '../AuthContext';
import {
  LayoutDashboard, Receipt, TrendingUp, MessageSquare,
  LogOut, Menu, X, ChevronLeft, Info,
} from 'lucide-react';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses',  icon: Receipt,         label: 'Expenses'  },
  { to: '/analytics', icon: TrendingUp,      label: 'Analytics' },
  { to: '/ask',       icon: MessageSquare,   label: 'Ask AI'    },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  onAbout: () => void;
}

export default function Sidebar({ open, onToggle, onAbout }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const initials = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="sidebar-overlay" onClick={onToggle} />}

      <aside className={`sidebar ${open ? 'sidebar--open' : 'sidebar--closed'}`}>
        {/* Logo row */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-mark">💰</span>
          {open && <span className="sidebar-logo-text">ExpenseAI</span>}
          <button className="sidebar-toggle" onClick={onToggle} title={open ? 'Collapse' : 'Expand'}>
            {open ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
              title={!open ? label : undefined}
            >
              <Icon size={18} className="sidebar-link-icon" />
              {open && <span className="sidebar-link-label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" title={user?.email ?? undefined}>
            <div className="sidebar-avatar">{initials}</div>
            {open && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-email">{user?.email}</span>
              </div>
            )}
          </div>
          <button className="sidebar-logout" onClick={onAbout} title="About ExpenseAI">
            <Info size={15} />
          </button>
          <button className="sidebar-logout" onClick={handleLogout} title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </aside>
    </>
  );
}
