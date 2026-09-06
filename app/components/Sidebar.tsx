'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { 
  LayoutDashboard, Package, Store, Truck, 
  ArrowDownToLine, ArrowUpFromLine, ClipboardList, RotateCcw, Map, 
  BarChart2, Box, Weight, History, Search, 
  PenTool, Settings, Power 
} from 'lucide-react';

interface Props {
  w: UseWarehouseReturn;
}

export default function Sidebar({ w }: Props) {
  const canAccessAudit = w.user?.role === 'superadmin';
  const canAccessLaporan = w.user?.role === 'superadmin';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ fontSize: '22px' }}></div>
        <div className="logo-badge">DLI Tambun</div>
        <div className="logo-sub">Warehouse Management System</div>
      </div>
      <nav>
        <div className="nav-group">
          <div className="nav-label">Overview</div>
          <button className={`nav-item ${w.activePage === 'dashboard' ? 'active' : ''}`} onClick={() => w.setActivePage('dashboard')}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Master Data</div>
          <button className={`nav-item ${w.activePage === 'produk' ? 'active' : ''}`} onClick={() => w.setActivePage('produk')}>
            <Package size={16} /> Produk Semen
          </button>
          <button className={`nav-item ${w.activePage === 'toko' ? 'active' : ''}`} onClick={() => { w.setActivePage('toko'); w.setSelectedToko(null); }}>
            <Store size={16} /> Toko
          </button>
          <button className={`nav-item ${w.activePage === 'angkutan' ? 'active' : ''}`} onClick={() => { w.setActivePage('angkutan'); w.setSelectedAngkutan(null); }}>
            <Truck size={16} /> Angkutan
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Operasional</div>
          <button className={`nav-item ${w.activePage === 'masuk' ? 'active' : ''}`} onClick={() => w.setActivePage('masuk')}>
            <ArrowDownToLine size={16} /> Barang Masuk
          </button>
          <button className={`nav-item ${w.activePage === 'keluar' ? 'active' : ''}`} onClick={() => w.setActivePage('keluar')}>
            <ArrowUpFromLine size={16} /> Barang Keluar
          </button>
          <button className={`nav-item ${w.activePage === 'do' ? 'active' : ''}`} onClick={() => { w.setActivePage('do'); w.setSelectedDO(null); }}>
            <ClipboardList size={16} /> DO / Surat Jalan
          </button>
          <button className={`nav-item ${w.activePage === 'cancel-do' ? 'active' : ''}`} onClick={() => w.setActivePage('cancel-do')}>
            <RotateCcw size={16} /> List Cancel DO
          </button>
          <button className={`nav-item ${w.activePage === 'pengiriman' ? 'active' : ''}`} onClick={() => w.setActivePage('pengiriman')}>
            <Map size={16} /> Pengiriman Bertahap
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Monitoring</div>
          <button className={`nav-item ${w.activePage === 'stok' ? 'active' : ''}`} onClick={() => w.setActivePage('stok')}>
            <BarChart2 size={16} /> Stok Semen
          </button>
          <button className={`nav-item ${w.activePage === 'pallet' ? 'active' : ''}`} onClick={() => w.setActivePage('pallet')}>
            <Box size={16} /> Peredaran Pallet
          </button>
          <button className={`nav-item ${w.activePage === 'tonase' ? 'active' : ''}`} onClick={() => w.setActivePage('tonase')}>
            <Weight size={16} /> Tonase Harian
          </button>
          {canAccessLaporan && (
            <button className={`nav-item ${w.activePage === 'laporan' ? 'active' : ''}`} onClick={() => w.setActivePage('laporan')}>
              <History size={16} /> Riwayat Transaksi
            </button>
          )}
          {canAccessAudit && (
            <button className={`nav-item ${w.activePage === 'audit' ? 'active' : ''}`} onClick={() => w.setActivePage('audit')}>
              <Search size={16} /> Audit Log
            </button>
          )}
        </div>
        <div className="nav-group">
          <div className="nav-label">Catatan</div>
          <button className={`nav-item ${w.activePage === 'whiteboard' ? 'active' : ''}`} onClick={() => w.setActivePage('whiteboard')}>
            <PenTool size={16} /> Whiteboard
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Akun</div>
          <button className={`nav-item ${w.activePage === 'settings' ? 'active' : ''}`} onClick={() => w.setActivePage('settings')}>
            <Settings size={16} /> Pengaturan
          </button>
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
        <button style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--danger)', width: '100%', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }} onClick={w.handleLogout}>
          <Power size={14} /> Disconnect
        </button>
      </div>
    </aside>
  );
}
