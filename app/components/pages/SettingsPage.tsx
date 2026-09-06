'use client';

import React, { useState } from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props { w: UseWarehouseReturn; }
type Theme = 'light' | 'dark';

export default function SettingsPage({ w }: Props) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const setAppTheme = (nextTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
  };

  return (
    <div className="page-grid" style={{ maxWidth: '720px' }}>
      <div>
        <div className="section-title">⚙️ Pengaturan</div>
        <div className="section-subtitle">Kelola keamanan akun dan tampilan aplikasi.</div>
      </div>

      <div className="card">
        <div className="card-title">Akun</div>
        <div className="form-grid">
          <div className="form-group full"><label>Nama</label><input value={w.user?.nama || ''} disabled /></div>
          <div className="form-group full"><label>Email</label><input value={w.user?.email || ''} disabled /></div>
          <div className="form-group full"><label>Role</label><input value={w.user?.role || ''} disabled /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🔒 Ganti Password</div>
        <div className="section-subtitle" style={{ marginBottom: '16px' }}>Gunakan minimal 8 karakter untuk menjaga keamanan akun.</div>
        <div className="form-grid">
          <div className="form-group full"><label>Password Baru</label><input type="password" value={w.newPassword} onChange={e => w.setNewPassword(e.target.value)} placeholder="Minimal 8 karakter" autoComplete="new-password" /></div>
          <div className="form-group full"><label>Konfirmasi Password</label><input type="password" value={w.confirmPassword} onChange={e => w.setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" autoComplete="new-password" /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={w.savePassword} disabled={w.isChangingPassword}>
          {w.isChangingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </div>

      <div className="card">
        <div className="card-title">🌓 Tampilan</div>
        <div className="flex-between gap-12" style={{ flexWrap: 'wrap' }}>
          <div>
            <div className="font-bold">Mode tema</div>
            <div className="section-subtitle">Pilih tampilan yang paling nyaman untuk digunakan.</div>
          </div>
          <div className="tabs" style={{ marginBottom: 0 }} aria-label="Pilih tema aplikasi">
            <button className={`tab ${theme === 'light' ? 'active' : ''}`} onClick={() => setAppTheme('light')} aria-pressed={theme === 'light'}>☀️ Terang</button>
            <button className={`tab ${theme === 'dark' ? 'active' : ''}`} onClick={() => setAppTheme('dark')} aria-pressed={theme === 'dark'}>🌙 Gelap</button>
          </div>
        </div>
      </div>
    </div>
  );
}
