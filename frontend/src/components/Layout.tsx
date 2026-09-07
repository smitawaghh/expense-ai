import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ExpenseProvider } from '../contexts/ExpenseContext';
import Sidebar from './Sidebar';
import ExpenseModal from './ExpenseModal';
import AboutModal from './AboutModal';
import Footer from './Footer';

export default function Layout() {
  const { user, emailVerified } = useAuth();
  const [sidebarOpen, setSidebar] = useState(window.innerWidth >= 1024);
  const [aboutOpen, setAboutOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <ExpenseProvider>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebar(v => !v)} onAbout={() => setAboutOpen(true)} />
        <div className={`main-area ${sidebarOpen ? 'main-area--wide' : 'main-area--narrow'}`}>
          {!emailVerified && (
            <div style={{
              background: 'rgba(62,207,142,.08)', border: '1px solid rgba(62,207,142,.25)',
              borderRadius: 8, padding: '8px 14px', margin: '12px 0', fontSize: '.82rem', color: 'var(--text-2)',
            }}>
              Your email isn&apos;t verified yet. <Link to="/verify-email" style={{ color: 'var(--accent-2)', fontWeight: 600 }}>Verify now</Link>
            </div>
          )}
          <Outlet />
          <Footer />
        </div>
        <ExpenseModal />
        <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      </div>
    </ExpenseProvider>
  );
}
