'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props {
  w: UseWarehouseReturn;
}

export default function LoginScreen({ w }: Props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '36px', width: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '38px' }}>🏭</div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', margin: '6px 0 4px' }}>DLI TAMBUN</h1>
          <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Warehouse Management System</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          {w.loginError && <div className="alert alert-danger">{w.loginError}</div>}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={w.loginEmail} onChange={e => w.setLoginEmail(e.target.value)} placeholder="nama@email.com" onKeyDown={e => e.key === 'Enter' && w.handleLogin()} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={w.loginPassword} onChange={e => w.setLoginPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && w.handleLogin()} />
          </div>
          <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={w.handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}
