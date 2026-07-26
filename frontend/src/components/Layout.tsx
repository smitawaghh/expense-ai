import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ExpenseProvider } from '../contexts/ExpenseContext';
import Sidebar from './Sidebar';
import ExpenseModal from './ExpenseModal';
import AboutModal from './AboutModal';
import Footer from './Footer';

export default function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebar] = useState(window.innerWidth >= 1024);
  const [aboutOpen, setAboutOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <ExpenseProvider>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebar(v => !v)} onAbout={() => setAboutOpen(true)} />
        <div className={`main-area ${sidebarOpen ? 'main-area--wide' : 'main-area--narrow'}`}>
          <Outlet />
          <Footer />
        </div>
        <ExpenseModal />
        <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      </div>
    </ExpenseProvider>
  );
}
