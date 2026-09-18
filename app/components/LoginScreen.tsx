'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { AlertCircle, Eye, EyeOff, Loader2, Moon, ShieldCheck, Sun } from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props {
  w: UseWarehouseReturn;
}

const CSS = `
  .lg-root {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(900px 420px at 15% -5%, var(--bg-soft, #1a1d24), transparent 60%),
      radial-gradient(900px 420px at 90% 110%, var(--bg-soft, #1a1d24), transparent 60%),
      var(--bg);
    padding: 26px 18px;
    position: relative;
    overflow: hidden;
  }

  .lg-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 44px 44px;
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
  }

  .lg-root::after {
    content: '';
    position: fixed;
    left: 0; right: 0; bottom: 0;
    height: 10px;
    background: repeating-linear-gradient(-45deg, var(--hz-a, #f6a60a) 0 14px, var(--hz-b, #111318) 14px 28px);
    opacity: 0.85;
    pointer-events: none;
    z-index: 1;
  }

  .lg-card {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 420px;
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: 28px;
    overflow: hidden;
    box-shadow: var(--sh-raise-lg);
  }

  .lg-card-top {
    position: relative;
    background: linear-gradient(135deg, #f8b02a, #dd8b04 70%);
    padding: 26px 30px 22px;
    display: flex;
    align-items: center;
    gap: 15px;
    overflow: hidden;
  }
  .lg-card-top::after {
    content: '';
    position: absolute;
    top: 0; right: 0; bottom: 0;
    width: 110px;
    background: repeating-linear-gradient(-45deg, rgba(33,21,0,0.08) 0 10px, transparent 10px 20px);
    pointer-events: none;
  }

  .lg-logo-box {
    width: 56px; height: 56px;
    background: rgba(33,21,0,0.16);
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    border: 1px solid rgba(33,21,0,0.14);
    overflow: hidden;
    box-shadow: 4px 4px 10px rgba(0,0,0,0.22), -3px -3px 8px rgba(255,255,255,0.25);
  }
  .lg-logo-img {
    width: 40px; height: 40px;
    object-fit: contain;
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.18));
  }

  .lg-brand { flex: 1; min-width: 0; position: relative; }
  .lg-title {
    font-size: 19px; font-weight: 900;
    color: #211500;
    letter-spacing: -0.01em; line-height: 1.15;
  }
  .lg-sub {
    font-size: 10px; font-weight: 900;
    color: rgba(33,21,0,0.6);
    text-transform: uppercase; letter-spacing: 0.12em;
    margin-top: 4px;
    display: flex; align-items: center; gap: 6px;
  }
  .lg-sub::before {
    content: '';
    width: 16px; height: 3px;
    border-radius: 99px;
    background: rgba(33,21,0,0.55);
  }

  .lg-body { padding: 26px 30px 28px; }

  .lg-heading {
    font-size: 20px; font-weight: 900;
    color: var(--text);
    margin-bottom: 3px; letter-spacing: -0.02em;
  }
  .lg-desc { font-size: 13px; color: var(--muted); margin-bottom: 22px; }

  .lg-field { margin-bottom: 16px; }
  .lg-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 10.5px; font-weight: 900;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--muted); margin-bottom: 8px;
  }

  .lg-input-wrap { position: relative; }
  .lg-input {
    width: 100%;
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 13px 15px;
    font-size: 16px;
    color: var(--text);
    outline: none;
    box-shadow: var(--sh-well);
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    font-family: inherit;
    -webkit-appearance: none;
  }
  .lg-input-wrap .lg-input { padding-right: 48px; }
  .lg-input::placeholder { color: var(--muted); opacity: 0.6; }
  .lg-input:focus {
    border-color: var(--accent);
    background: var(--card);
    box-shadow: 0 0 0 3px rgba(246,166,10,0.16), var(--sh-well);
  }
  .lg-input:disabled { opacity: 0.5; cursor: not-allowed; }

  .lg-eye {
    position: absolute; right: 7px; top: 50%; transform: translateY(-50%);
    width: 38px; height: 38px;
    border: none; background: transparent; border-radius: 12px;
    color: var(--muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.12s, color 0.12s;
  }
  .lg-eye:hover { background: var(--card); color: var(--accent); }
  .lg-eye svg { width: 17px; height: 17px; }

  .lg-hint {
    display: flex; align-items: center; gap: 6px;
    margin-top: 8px; font-size: 12px; font-weight: 800; color: var(--warn);
  }
  .lg-hint svg { width: 13px; height: 13px; flex-shrink: 0; }

  /* Turnstile wrapper */
  .lg-captcha-wrap {
    margin-bottom: 18px;
    display: flex;
    justify-content: center;
  }

  .lg-error {
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 18px; padding: 13px 15px;
    font-size: 13px; font-weight: 700; line-height: 1.45;
    color: var(--danger);
    background: rgba(255,92,92,0.09);
    border: 1px solid rgba(255,92,92,0.32);
    border-radius: 14px;
  }
  .lg-error svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }

  .lg-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    padding: 14px 18px;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 16px;
    font-size: 14px; font-weight: 900;
    color: #211500;
    background: linear-gradient(145deg, #f8b02a, var(--accent, #ed9608));
    cursor: pointer;
    transition: transform 0.08s, box-shadow 0.16s, opacity 0.12s;
    box-shadow: 5px 5px 14px rgba(0,0,0,0.28), -4px -4px 10px rgba(255,255,255,0.08);
    font-family: inherit; letter-spacing: 0.01em;
    margin-top: 4px;
    -webkit-tap-highlight-color: transparent;
  }
  .lg-btn:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 7px 7px 18px rgba(0,0,0,0.32), -4px -4px 10px rgba(255,255,255,0.08);
  }
  .lg-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: var(--sh-press); }
  .lg-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; transform: none; }

  .lg-spin { animation: lg-spin 0.75s linear infinite; }
  @keyframes lg-spin { to { transform: rotate(360deg); } }

  .lg-foot {
    margin-top: 22px; padding-top: 18px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; gap: 7px;
    font-size: 11px; color: var(--muted); font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .lg-foot svg { width: 12px; height: 12px; color: var(--success); }
  .lg-foot-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--border2); display: inline-block; }

  .lg-theme {
    position: fixed; top: 16px; right: 16px; z-index: 10;
    padding: 8px 14px; border-radius: 99px;
    border: 1px solid var(--border2);
    background: var(--card); color: var(--text-sub);
    font-size: 12px; font-weight: 800;
    cursor: pointer;
    display: flex; align-items: center; gap: 7px;
    transition: border-color 0.12s, color 0.12s, box-shadow 0.16s;
    box-shadow: var(--sh-raise);
    font-family: inherit;
  }
  .lg-theme:hover { border-color: var(--accent); color: var(--accent); }
  .lg-theme svg { width: 15px; height: 15px; }

  @media (max-width: 440px) {
    .lg-card { border-radius: 24px; }
    .lg-card-top { padding: 20px 22px 18px; }
    .lg-body { padding: 22px 22px 24px; }
    .lg-heading { font-size: 18px; }
  }
`;

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';

export default function LoginScreen({ w }: Props) {
  const [showPw, setShowPw]   = useState(false);
  const [capsOn, setCapsOn]   = useState(false);
  const [theme, setTheme]     = useState<'light' | 'dark'>('dark');
  const [token, setToken]     = useState<string | null>(null);
  const [capErr, setCapErr]   = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef    = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

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

  const doSubmit = () => {
    if (w.loginLockSeconds > 0 || w.isLoggingIn) return;
    if (!token) {
      setCapErr('Selesaikan verifikasi captcha terlebih dahulu.');
      return;
    }
    setCapErr('');
    w.handleLogin();
    // reset Turnstile setelah submit
    setToken(null);
  };

  const onEmailKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); pwRef.current?.focus(); }
  };
  const onPwKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsOn(typeof e.getModifierState === 'function' ? e.getModifierState('CapsLock') : false);
    if (e.key === 'Enter') doSubmit();
  };

  const locked    = w.loginLockSeconds > 0;
  const remaining = w.loginLockSeconds;

  return (
    <>
      <style>{CSS}</style>

      <button className="lg-theme" onClick={toggleTheme} aria-label="Ganti tema">
        {theme === 'light' ? <Moon /> : <Sun />}
        {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
      </button>

      <div className="lg-root">
        <div className="lg-card">
          {/* Brand band */}
          <div className="lg-card-top">
            <div className="lg-logo-box">
              <img className="lg-logo-img" src="/logo.png" alt="DLI Tambun" />
            </div>
            <div className="lg-brand">
              <div className="lg-title">DLI TAMBUN</div>
              <div className="lg-sub">Warehouse Ops</div>
            </div>
          </div>

          {/* Form body */}
          <div className="lg-body">
            <div className="lg-heading">Masuk ke Sistem</div>
            <div className="lg-desc">Gunakan akun resmi gudang untuk melanjutkan.</div>

            {(locked || w.loginError) && (
              <div className="lg-error" role="alert" aria-live="assertive">
                <AlertCircle />
                <span>
                  {locked
                    ? `Login dikunci. Coba lagi dalam ${remaining} detik.`
                    : w.loginError}
                </span>
              </div>
            )}

            <div className="lg-field">
              <label className="lg-label" htmlFor="lg-email">Email</label>
              <input
                id="lg-email"
                ref={emailRef}
                className="lg-input"
                type="email"
                name="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                inputMode="email"
                placeholder="nama@perusahaan.com"
                value={w.loginEmail}
                onChange={e => w.setLoginEmail(e.target.value)}
                onKeyDown={onEmailKey}
                disabled={locked}
              />
            </div>

            <div className="lg-field">
              <label className="lg-label" htmlFor="lg-password">Password</label>
              <div className="lg-input-wrap">
                <input
                  id="lg-password"
                  ref={pwRef}
                  className="lg-input"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={w.loginPassword}
                  onChange={e => w.setLoginPassword(e.target.value)}
                  onKeyDown={onPwKey}
                  onKeyUp={onPwKey}
                  disabled={locked}
                />
                <button
                  className="lg-eye"
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPw ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {capsOn && (
                <div className="lg-hint">
                  <AlertCircle /> Caps Lock aktif
                </div>
              )}
            </div>

            {/* Cloudflare Turnstile */}
            <div className="lg-captcha-wrap">
              <Turnstile
                siteKey={SITE_KEY}
                options={{ theme, size: 'normal' }}
                onSuccess={t => { setToken(t); setCapErr(''); }}
                onExpire={() => setToken(null)}
                onError={() => { setToken(null); setCapErr('Verifikasi gagal, coba lagi.'); }}
              />
            </div>
            {capErr && (
              <div className="lg-hint" style={{ color: 'var(--danger)', marginBottom: '12px' }}>
                <AlertCircle /> {capErr}
              </div>
            )}

            <button
              className="lg-btn"
              onClick={doSubmit}
              disabled={w.isLoggingIn || locked}
            >
              {w.isLoggingIn
                ? <><Loader2 className="lg-spin" style={{ width: 16, height: 16 }} /> Memverifikasi…</>
                : 'Masuk →'}
            </button>

            <div className="lg-foot">
              <ShieldCheck />
              <span>Akses terbatas</span>
              <span className="lg-foot-dot" />
              <span>Pengguna resmi</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
