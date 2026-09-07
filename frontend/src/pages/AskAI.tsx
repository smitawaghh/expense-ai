import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, Sparkles, AlertTriangle, WifiOff } from 'lucide-react';
import api from '../lib/api';
import type { ApiErr } from '../types';

const IS_DEV = import.meta.env.DEV;

interface Msg {
  role: string;
  content: string;
  meta?: number;
  isError?: boolean;
}

const SUGGESTIONS = [
  'What did I spend the most on this month?',
  'Am I over my monthly budget?',
  'How much did I spend on food last month?',
  'Which 3 categories cost me the most?',
  'How can I cut down my expenses?',
  'Compare my spending this month vs last month',
];

function Message({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`msg-row${isUser ? ' msg-row--user' : ''}`}>
      {!isUser && <div className="msg-avatar"><Bot size={14} /></div>}
      <div
        className={`msg-bubble${isUser ? ' msg-bubble--user' : ' msg-bubble--ai'}`}
        style={msg.isError ? { borderColor: 'rgba(245,85,85,.25)', color: 'var(--danger)' } : {}}
      >
        <p className="msg-text">{msg.content}</p>
        {msg.meta != null && (
          <span className="msg-meta">Analysed {msg.meta} record{msg.meta !== 1 ? 's' : ''} · last 90 days</span>
        )}
      </div>
    </div>
  );
}

/* Shown only in development — never to end users */
function DevSetupGuide() {
  if (!IS_DEV) return null;
  return (
    <div className="ai-setup-banner">
      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <strong>DEV ONLY — AI key needed</strong>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#3ecf8e' }}>⭐ Google Gemini (Free)</div>
            <ol style={{ paddingLeft: 16, lineHeight: 2, fontSize: '.78rem', color: 'var(--text-2)' }}>
              <li>Go to <strong>aistudio.google.com/apikey</strong></li>
              <li>Click <strong>Create API key</strong> (key starts with <code>AIza</code>)</li>
              <li>Add to <code style={{ background: 'rgba(255,255,255,.06)', padding: '1px 5px', borderRadius: 4 }}>.env</code>:<br />
                <code style={{ fontSize: '.72rem', color: '#3ecf8e' }}>GEMINI_API_KEY=AIzaSy...</code>
              </li>
              <li>Restart backend: <code>npm run dev</code></li>
            </ol>
          </div>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#c875e8' }}>Anthropic Claude</div>
            <ol style={{ paddingLeft: 16, lineHeight: 2, fontSize: '.78rem', color: 'var(--text-2)' }}>
              <li>Go to <strong>console.anthropic.com</strong></li>
              <li>API Keys → Create key</li>
              <li>Add to <code style={{ background: 'rgba(255,255,255,.06)', padding: '1px 5px', borderRadius: 4 }}>.env</code>:<br />
                <code style={{ fontSize: '.72rem', color: '#c875e8' }}>ANTHROPIC_API_KEY=sk-ant-...</code>
              </li>
              <li>Restart backend</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Shown in production when AI is unavailable */
function UnavailableState() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 40, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <WifiOff size={24} style={{ color: 'var(--text-3)' }} />
      </div>
      <div>
        <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>AI Assistant Unavailable</p>
        <p style={{ fontSize: '.82rem', color: 'var(--text-3)', maxWidth: 300 }}>
          The AI feature is temporarily unavailable. Your expense data is safe — please try again later.
        </p>
      </div>
    </div>
  );
}

export default function AskAI() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', content: "Hi! I'm your AI financial analyst. I analyse your last 90 days of expenses and answer anything about your spending. Try a suggestion below!" },
  ]);
  const [input,       setInput]       = useState('');
  const [asking,      setAsking]      = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || asking || unavailable) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setAsking(true);
    try {
      const { data } = await api.post('/api/ask', { question: q });
      setMessages(prev => [...prev, { role: 'ai', content: data.answer, meta: data.recordsUsed }]);
    } catch (err) {
      const e = err as ApiErr;
      const status = e.response?.status;
      const msg    = e.response?.data?.error ?? '';

      const isConfigError = status === 401 || status === 503
        || msg.includes('API key') || msg.includes('not configured') || msg.includes('quota') || status === 429;

      if (isConfigError) {
        setUnavailable(true);
        if (!IS_DEV) {
          setMessages(prev => [...prev, {
            role: 'ai', isError: true,
            content: 'AI assistant is temporarily unavailable. Please try again later.',
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'ai', isError: true,
            content: `[DEV] ${msg || 'AI not configured — add a key to .env'}`,
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'ai', isError: true,
          content: IS_DEV ? `[DEV] ${msg}` : 'Something went wrong. Please try again.',
        }]);
      }
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="page ask-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ask AI</h1>
          <p className="page-sub">Your personal finance analyst — analyses last 90 days of data</p>
        </div>
        <div className="ai-badge-header">
          <Sparkles size={13} /> Gemini 3.6 Flash
        </div>
      </div>

      {/* Dev-only setup guide — hidden from production users */}
      {unavailable && <DevSetupGuide />}

      <div className="chat-container">
        {/* Production unavailable state replaces the chat */}
        {unavailable && !IS_DEV ? (
          <UnavailableState />
        ) : (
          <>
            <div className="chat-messages">
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {asking && (
                <div className="msg-row">
                  <div className="msg-avatar"><Bot size={14} /></div>
                  <div className="msg-bubble msg-bubble--ai msg-bubble--typing">
                    <span className="dot-pulse" /><span className="dot-pulse" /><span className="dot-pulse" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 1 && !unavailable && (
              <div className="suggestions">
                <p className="suggestions-label">Quick questions</p>
                <div className="suggestions-grid">
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <form className="chat-input-row" onSubmit={e => { e.preventDefault(); send(input); }}>
              <input
                className="chat-input"
                placeholder={unavailable ? 'AI temporarily unavailable…' : 'Ask anything about your expenses…'}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={asking || (unavailable && !IS_DEV)}
                autoFocus
              />
              <button type="submit" className="chat-send" disabled={asking || !input.trim() || (unavailable && !IS_DEV)}>
                {asking ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
