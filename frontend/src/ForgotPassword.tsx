import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase-config';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { friendlyAuthError } from './lib/firebaseErrors';
import './App.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      // Firebase's own config controls whether unknown emails throw here;
      // either way we show the same neutral confirmation to avoid leaking
      // which emails have accounts.
      const err = error as { code?: string };
      if (err.code !== 'auth/user-not-found') {
        toast.error(friendlyAuthError(error));
        setLoading(false);
        return;
      }
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💰 ExpenseAI</div>
        <div className="auth-tagline">Reset your password</div>

        <div className="auth-form">
          <h2>Forgot password?</h2>

          {sent ? (
            <p style={{ color: 'var(--text-3)', fontSize: '.85rem', lineHeight: 1.6 }}>
              Password reset email sent. Check your inbox and spam folder.
            </p>
          ) : (
            <>
              <p style={{ color: 'var(--text-3)', fontSize: '.85rem', lineHeight: 1.6, marginBottom: 16 }}>
                Enter your email and we&apos;ll send you a password reset link.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="auth-group">
                  <label htmlFor="forgot-email">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                  style={{ marginTop: 8 }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}

          <div className="auth-footer">
            <Link to="/login">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
