import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from './firebase-config';
import { useAuth } from './AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { friendlyAuthError } from './lib/firebaseErrors';
import './App.css';

const RESEND_COOLDOWN_S = 60;

const VerifyEmail = () => {
  const { user, emailVerified, refreshVerification, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;
  if (emailVerified) return <Navigate to="/" replace />;

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_S);
    const timer = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) { clearInterval(timer); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (!auth.currentUser || resending || cooldown > 0) return;
    setResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent. Check your inbox and spam folder.');
      startCooldown();
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    try {
      const verified = await refreshVerification();
      if (verified) {
        toast.success('Email verified!');
        navigate('/');
      } else {
        toast.info('Not verified yet. Please check your inbox for the link.');
      }
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💰 ExpenseAI</div>
        <div className="auth-tagline">One more step</div>

        <div className="auth-form">
          <h2>Verify your email</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '.85rem', lineHeight: 1.6, marginBottom: 20 }}>
            We sent a verification link to <strong>{user.email}</strong>. Click the link, then
            come back here and press "I've verified".
          </p>

          <button
            type="button"
            className="btn btn-primary btn-full"
            disabled={checking}
            onClick={handleCheckVerified}
            style={{ marginBottom: 10 }}
          >
            {checking ? 'Checking…' : "I've verified — Refresh"}
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-full"
            disabled={resending || cooldown > 0}
            onClick={handleResend}
          >
            {resending
              ? 'Sending…'
              : cooldown > 0
              ? `Resend available in ${cooldown}s`
              : 'Resend verification email'}
          </button>

          <div className="auth-footer">
            Wrong account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); navigate('/login'); }}>
              Sign out
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
