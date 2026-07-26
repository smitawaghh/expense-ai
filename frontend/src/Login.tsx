import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
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
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const msg =
        err.code === 'auth/invalid-credential'
          ? 'Incorrect email or password.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please wait a few minutes and try again.'
          : err.message;
      toast.error(msg);
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
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
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
