import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { friendlyAuthError } from './lib/firebaseErrors';
import './App.css';

const Login = () => {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        toast.warning("Welcome back! Your email isn't verified yet — you can verify it anytime from the app.");
      } else {
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (error) {
      toast.error(friendlyAuthError(error));
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💰 ExpenseAI</div>
        <div className="auth-tagline">Track. Analyse. Save.</div>

        <div className="auth-form">
          <h2>Sign in to your account</h2>
          <form onSubmit={handleLogin}>
            <div className="auth-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link to="/forgot-password" style={{ fontSize: '.78rem', color: 'var(--accent-2)' }}>
                  Forgot password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don&apos;t have an account? <Link to="/signup">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
