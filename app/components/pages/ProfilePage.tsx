'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props { w: UseWarehouseReturn; }

export default function ProfilePage({ w }: Props) {
  return (
    <div>
      <div className="section-title">👤 Profil Pengguna</div>
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div className="form-grid">
          <div className="form-group full"><label>Nama</label><input value={w.user?.nama || ''} disabled /></div>
          <div className="form-group full"><label>Email</label><input value={w.user?.email || ''} disabled /></div>
          <div className="form-group full"><label>Role</label><input value={w.user?.role} disabled /></div>
        </div>
      </div>
      <div className="card" style={{ padding: '20px' }}>
        <div className="section-subtitle">🔒 Ubah Password</div>
        <div className="form-grid">
          <div className="form-group full"><label>Password Baru</label><input type="password" value={w.newPassword} onChange={e => w.setNewPassword(e.target.value)} placeholder="Minimal 8 karakter" /></div>
          <div className="form-group full"><label>Konfirmasi Password</label><input type="password" value={w.confirmPassword} onChange={e => w.setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" /></div>
        </div>
        <button className="btn btn-primary w-full" style={{ marginTop: '20px', justifyContent: 'center' }} onClick={w.savePassword} disabled={w.isChangingPassword}>{w.isChangingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}</button>
      </div>
    </div>
  );
}
