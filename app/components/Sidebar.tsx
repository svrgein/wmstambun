'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props {
  w: UseWarehouseReturn;
}

export default function Sidebar({ w }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ fontSize: '22px' }}>🏭</div>
        <div className="logo-badge">DLI Tambun</div>
        <div className="logo-sub">Warehouse Management System</div>
      </div>
      <nav>
        <div className="nav-group">
          <div className="nav-label">Overview</div>
          <button className={`nav-item ${w.activePage === 'dashboard' ? 'active' : ''}`} onClick={() => w.setActivePage('dashboard')}>📊 Dashboard</button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Master Data</div>
          <button className={`nav-item ${w.activePage === 'produk' ? 'active' : ''}`} onClick={() => w.setActivePage('produk')}>📦 Produk Semen</button>
          <button className={`nav-item ${w.activePage === 'toko' ? 'active' : ''}`} onClick={() => { w.setActivePage('toko'); w.setSelectedToko(null); }}>🏪 Toko</button>
          <button className={`nav-item ${w.activePage === 'angkutan' ? 'active' : ''}`} onClick={() => { w.setActivePage('angkutan'); w.setSelectedAngkutan(null); }}>🚚 Angkutan</button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Operasional</div>
          <button className={`nav-item ${w.activePage === 'masuk' ? 'active' : ''}`} onClick={() => w.setActivePage('masuk')}>⬇️ Barang Masuk</button>
          <button className={`nav-item ${w.activePage === 'keluar' ? 'active' : ''}`} onClick={() => w.setActivePage('keluar')}>⬆️ Barang Keluar</button>
          <button className={`nav-item ${w.activePage === 'do' ? 'active' : ''}`} onClick={() => { w.setActivePage('do'); w.setSelectedDO(null); }}>📋 DO / Surat Jalan</button>
          <button className={`nav-item ${w.activePage === 'pengiriman' ? 'active' : ''}`} onClick={() => w.setActivePage('pengiriman')}>🗺️ Pengiriman Bertahap</button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Monitoring</div>
          <button className={`nav-item ${w.activePage === 'stok' ? 'active' : ''}`} onClick={() => w.setActivePage('stok')}>📈 Stok Semen</button>
          <button className={`nav-item ${w.activePage === 'pallet' ? 'active' : ''}`} onClick={() => w.setActivePage('pallet')}>🟫 Peredaran Pallet</button>
          <button className={`nav-item ${w.activePage === 'laporan' ? 'active' : ''}`} onClick={() => w.setActivePage('laporan')}>📑 Riwayat Transaksi</button>
          {w.user?.role === 'admin' && (
            <button className={`nav-item ${w.activePage === 'audit' ? 'active' : ''}`} onClick={() => w.setActivePage('audit')}>🔍 Audit Log</button>
          )}
        </div>
        <div className="nav-group">
          <div className="nav-label">Catatan</div>
          <button className={`nav-item ${w.activePage === 'whiteboard' ? 'active' : ''}`} onClick={() => w.setActivePage('whiteboard')}>📝 Whiteboard</button>
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{w.user!.nama[0].toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '12px' }}>{w.user!.nama}</div>
            <div style={{ color: 'var(--muted)', fontSize: '10.5px', textTransform: 'uppercase' }}>{w.user!.role}</div>
          </div>
        </div>
        <button style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', width: '100%', padding: '5px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onClick={w.handleLogout}>Disconnect 🔌</button>
      </div>
    </aside>
  );
}
