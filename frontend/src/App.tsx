import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import AskAI from './pages/AskAI';
import Login from './Login';
import Signup from './signup';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth pages */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected app shell */}
          <Route element={<Layout />}>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/expenses"  element={<Expenses />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ask"       element={<AskAI />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        toastClassName="custom-toast"
      />
    </AuthProvider>
  );
}
