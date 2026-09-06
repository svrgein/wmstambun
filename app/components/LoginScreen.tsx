'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Info, Loader } from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props {
  w: UseWarehouseReturn;
}

const CSS = `
  .lg-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: var(--bg);
  }
  .lg-card {
    width: 100%;
    max-width: 400px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px 30px 24px;
    box-shadow: 0 16px 40px -28px rgba(0,0,0,0.45);
  }
  .lg-head {
    text-align: center;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 20px;
  }
  .lg-logo {
    width: 84px;
    height: 84px;
    object-fit: contain;
    display: block;
    margin: 0 auto 10px;
  }
  .lg-title {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: var(--accent);
  }
  .lg-sub {
    margin-top: 4px;
    font-size: 11.5px;
    color: var(--muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .lg-field { margin-bottom: 16px; }
  .lg-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .lg-wrap { position: relative; }
  .lg-control {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .lg-wrap .lg-control { padding-right: 40px; }
  .lg-control::placeholder { color: var(--muted); opacity: 0.7; }
  .lg-control:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(232,160,69,0.14); }
  .lg-control:disabled { opacity: 0.6; }
  .lg-eye {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    border-radius: 6px;
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lg-eye:hover { background: var(--card2); color: var(--accent); }
  .lg-eye svg { width: 16px; height: 16px; }
  .lg-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--warn);
  }
  .lg-hint svg { width: 12px; height: 12px; flex-shrink: 0; }
  .lg-error {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 16px;
    padding: 9px 12px;
    font-size: 12.5px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--danger);
    background: rgba(224,82,82,0.08);
    border: 1px solid rgba(224,82,82,0.22);
    border-radius: 8px;
  }
  .lg-error svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px; }
  .lg-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 14px;
    border: none;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 800;
    color: #000;
    background: var(--accent);
    cursor: pointer;
    transition: opacity 0.12s;
  }
  .lg-btn:hover:not(:disabled) { opacity: 0.88; }
  .lg-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .lg-spin { animation: lg-spin 0.8s linear infinite; }
  @keyframes lg-spin { to { transform: rotate(360deg); } }
  .lg-foot {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 11px;
    color: var(--muted);
  }
  .lg-theme {
    position: fixed;
    top: 14px;
    right: 16px;
    padding: 6px 11px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
  }
  .lg-theme:hover { color: var(--accent); border-color: var(--accent); }
`;

export default function LoginScreen({ w }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  const locked = w.loginLockSeconds > 0;
  const remaining = w.loginLockSeconds;

  useEffect(() => {
    const t = (localStorage.getItem('theme') as 'light' | 'dark' | null)
      ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const onEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      pwRef.current?.focus();
    }
  };

  const onPwKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsOn(typeof e.getModifierState === 'function' ? e.getModifierState('CapsLock') : false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="lg-screen">
        <button className="lg-theme" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Gelap' : '☀️ Terang'}
        </button>

        <div className="lg-card">
          <div className="lg-head">
            <img className="lg-logo" src="/logo.png" alt="DLI Tambun" />
            <div className="lg-title">DLI TAMBUN</div>
            <div className="lg-sub">Warehouse Management System</div>
          </div>

          {(locked || w.loginError) && (
            <div className="lg-error" role="alert" aria-live="assertive">
              <Info />
              <span>
                {locked
                  ? `Terlalu banyak percobaan gagal. Login dikunci — coba lagi dalam ${remaining} detik.`
                  : w.loginError}
              </span>
            </div>
          )}

          <div className="lg-field">
            <label className="lg-label" htmlFor="lg-email">Email</label>
            <input
              id="lg-email"
              ref={emailRef}
              className="lg-control"
              type="email"
              name="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="email"
              placeholder="nama@perusahaan.com"
              value={w.loginEmail}
              onChange={e => w.setLoginEmail(e.target.value)}
              onKeyDown={onEmailKeyDown}
              disabled={locked}
            />
          </div>

          <div className="lg-field">
            <label className="lg-label" htmlFor="lg-password">Password</label>
            <div className="lg-wrap">
              <input
                id="lg-password"
                ref={pwRef}
                className="lg-control"
                type={showPw ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={w.loginPassword}
                onChange={e => w.setLoginPassword(e.target.value)}
                onKeyDown={e => { onPwKey(e); if (e.key === 'Enter') w.handleLogin(); }}
                onKeyUp={onPwKey}
                disabled={locked}
              />
              <button
                className="lg-eye"
                type="button"
                onClick={() => setShowPw(p => !p)}
                title={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {capsOn && (
              <div className="lg-hint"><Info /> Caps Lock aktif</div>
            )}
          </div>

          <button
            className="lg-btn"
            onClick={w.handleLogin}
            disabled={w.isLoggingIn || locked}
          >
            {w.isLoggingIn ? (
              <>
                <Loader className="lg-spin" />
                Memverifikasi…
              </>
            ) : 'Login'}
          </button>

          <div className="lg-foot">
            Akses terbatas untuk pengguna resmi
          </div>
        </div>
      </div>
    </>
  );
}
