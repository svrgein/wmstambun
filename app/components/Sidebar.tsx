'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import {
  LayoutDashboard, Package, Store, Truck,
  ArrowDownToLine, ArrowUpFromLine, ClipboardList, RotateCcw, Map,
  BarChart2, Box, Weight, History, Search,
  PenTool, Settings, Power, Factory, ClipboardCheck, Receipt
} from 'lucide-react';

interface Props {
  w: UseWarehouseReturn;
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ w, open, onClose }: Props) {
  const canAccessAudit = w.user?.role === 'superadmin';
  const canAccessLaporan = w.user?.role === 'superadmin';

  const nav = (page: string, extra?: () => void) => {
    w.setActivePage(page);
    extra?.();
    onClose?.();
  };

  return (
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Factory /></div>
        <div>
          <div className="logo-badge">DLI Tambun</div>
          <div className="logo-sub">Warehouse Ops</div>
        </div>
      </div>
      <nav>
        <div className="nav-group">
          <div className="nav-label">Overview</div>
          <button className={`nav-item ${w.activePage === 'dashboard' ? 'active' : ''}`} onClick={() => nav('dashboard')}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Master Data</div>
          <button className={`nav-item ${w.activePage === 'produk' ? 'active' : ''}`} onClick={() => nav('produk')}>
            <Package size={16} /> Produk Semen
          </button>
          <button className={`nav-item ${w.activePage === 'toko' ? 'active' : ''}`} onClick={() => nav('toko', () => w.setSelectedToko(null))}>
            <Store size={16} /> Toko
          </button>
          <button className={`nav-item ${w.activePage === 'angkutan' ? 'active' : ''}`} onClick={() => nav('angkutan', () => w.setSelectedAngkutan(null))}>
            <Truck size={16} /> Angkutan
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Operasional</div>
          <button className={`nav-item ${w.activePage === 'masuk' ? 'active' : ''}`} onClick={() => nav('masuk')}>
            <ArrowDownToLine size={16} /> Barang Masuk
          </button>
          <button className={`nav-item ${w.activePage === 'keluar' ? 'active' : ''}`} onClick={() => nav('keluar')}>
            <ArrowUpFromLine size={16} /> Barang Keluar
          </button>
          <button className={`nav-item ${w.activePage === 'do' ? 'active' : ''}`} onClick={() => nav('do', () => w.setSelectedDO(null))}>
            <ClipboardList size={16} /> DO / Surat Jalan
          </button>
          <button className={`nav-item ${w.activePage === 'cancel-do' ? 'active' : ''}`} onClick={() => nav('cancel-do')}>
            <RotateCcw size={16} /> List Cancel DO
          </button>
          <button className={`nav-item ${w.activePage === 'pengiriman' ? 'active' : ''}`} onClick={() => nav('pengiriman')}>
            <Map size={16} /> Pengiriman Bertahap
          </button>
          <button className={`nav-item ${w.activePage === 'tanda-terima' ? 'active' : ''}`} onClick={() => nav('tanda-terima')}>
            <Receipt size={16} /> Tanda Terima DO
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Administrasi</div>
          <button className={`nav-item ${w.activePage === 'setoran-sj' ? 'active' : ''}`} onClick={() => nav('setoran-sj')}>
            <ClipboardCheck size={16} /> Setoran Surat Jalan
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Monitoring</div>
          <button className={`nav-item ${w.activePage === 'stok' ? 'active' : ''}`} onClick={() => nav('stok')}>
            <BarChart2 size={16} /> Stok Semen
          </button>
          <button className={`nav-item ${w.activePage === 'pallet' ? 'active' : ''}`} onClick={() => nav('pallet')}>
            <Box size={16} /> Peredaran Pallet
          </button>
          <button className={`nav-item ${w.activePage === 'tonase' ? 'active' : ''}`} onClick={() => nav('tonase')}>
            <Weight size={16} /> Tonase Harian
          </button>
          {canAccessLaporan && (
            <button className={`nav-item ${w.activePage === 'laporan' ? 'active' : ''}`} onClick={() => nav('laporan')}>
              <History size={16} /> Riwayat Transaksi
            </button>
          )}
          {canAccessAudit && (
            <button className={`nav-item ${w.activePage === 'audit' ? 'active' : ''}`} onClick={() => nav('audit')}>
              <Search size={16} /> Audit Log
            </button>
          )}
        </div>
        <div className="nav-group">
          <div className="nav-label">Catatan</div>
          <button className={`nav-item ${w.activePage === 'whiteboard' ? 'active' : ''}`} onClick={() => nav('whiteboard')}>
            <PenTool size={16} /> Whiteboard
          </button>
        </div>
        <div className="nav-group">
          <div className="nav-label">Akun</div>
          <button className={`nav-item ${w.activePage === 'settings' ? 'active' : ''}`} onClick={() => nav('settings')}>
            <Settings size={16} /> Pengaturan
          </button>
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{(w.user!.nama || 'U')[0].toUpperCase()}</div>
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
