'use client';

import React, { lazy, Suspense } from 'react';

// Hooks
import { useWarehouse } from '@/app/hooks/useWarehouse';

// Styles (disuntikkan ke head)
import { CSS } from '@/app/lib/constants';

// Layout & Core
import LoginScreen from '@/app/components/LoginScreen';
import Sidebar from '@/app/components/Sidebar';
import Topbar from '@/app/components/Topbar';

// Pages — di-load saat menu dibuka (code-splitting biar app lebih ringan)
const DashboardPage = lazy(() => import('@/app/components/pages/DashboardPage').then(m => ({ default: m.default })));
const ProdukPage = lazy(() => import('@/app/components/pages/ProdukPage').then(m => ({ default: m.default })));
const TokoPage = lazy(() => import('@/app/components/pages/TokoPage').then(m => ({ default: m.default })));
const AngkutanPage = lazy(() => import('@/app/components/pages/AngkutanPage').then(m => ({ default: m.default })));
const MasukPage = lazy(() => import('@/app/components/pages/MasukPage').then(m => ({ default: m.default })));
const KeluarPage = lazy(() => import('@/app/components/pages/KeluarPage').then(m => ({ default: m.default })));
const DOPage = lazy(() => import('@/app/components/pages/DOPage').then(m => ({ default: m.default })));
const CancelDOPage = lazy(() => import('@/app/components/pages/CancelDOPage').then(m => ({ default: m.default })));
const PengirimanPage = lazy(() => import('@/app/components/pages/PengirimanPage').then(m => ({ default: m.default })));
const SetoranSJPage = lazy(() => import('@/app/components/pages/SetoranSJPage').then(m => ({ default: m.default })));
const TandaTerimaPage = lazy(() => import('@/app/components/pages/TandaTerimaPage').then(m => ({ default: m.default })));
const StokPage = lazy(() => import('@/app/components/pages/StokPage').then(m => ({ default: m.default })));
const PalletPage = lazy(() => import('@/app/components/pages/PalletPage').then(m => ({ default: m.default })));
const LaporanPage = lazy(() => import('@/app/components/pages/LaporanPage').then(m => ({ default: m.default })));
const AuditPage = lazy(() => import('@/app/components/pages/AuditPage').then(m => ({ default: m.default })));
const TonasePage = lazy(() => import('@/app/components/pages/TonasePage').then(m => ({ default: m.default })));
const WhiteboardPage = lazy(() => import('@/app/components/pages/WhiteboardPage').then(m => ({ default: m.default })));
const SettingsPage = lazy(() => import('@/app/components/pages/SettingsPage').then(m => ({ default: m.default })));
import WhiteboardDetailModal from '@/app/components/WhiteboardDetailModal';

// Modals
import ModalProduk from '@/app/components/modals/ModalProduk';
import ModalToko from '@/app/components/modals/ModalToko';
import ModalAngkutan from '@/app/components/modals/ModalAngkutan';
import ModalDO from '@/app/components/modals/ModalDO';
import ModalPengiriman from '@/app/components/modals/ModalPengiriman';
import ModalPallet from '@/app/components/modals/ModalPallet';
import ModalCatatan from '@/app/components/modals/ModalCatatan';
import ModalPalletStok from '@/app/components/modals/ModalPalletStok';

// Loading screen khusus saat cek user
function LoadingScreen() {
  return (
    <>
      <style>{`
        @keyframes wms-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wms-blink {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .wms-loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 26px;
          background:
            radial-gradient(700px 340px at 50% -10%, var(--bg-soft, #181b22), transparent 70%),
            var(--bg, #14161b);
          color: var(--accent, #f6a60a);
          font-family: 'Segoe UI', sans-serif;
          position: relative;
        }
        .wms-loading-container::after {
          content: '';
          position: fixed;
          left: 0; right: 0; bottom: 0;
          height: 8px;
          background: repeating-linear-gradient(-45deg, var(--hz-a, #f6a60a) 0 12px, var(--hz-b, #111318) 12px 24px);
          opacity: 0.8;
        }
        .wms-loading-ring {
          position: relative;
          width: 76px;
          height: 76px;
        }
        .wms-ring-segment {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 5px solid transparent;
          border-top-color: var(--accent, #f6a60a);
          animation: wms-spin 1.1s linear infinite;
          box-shadow: 0 0 18px rgba(246,166,10,0.15);
        }
        .wms-ring-segment:nth-child(2) {
          border-top-color: color-mix(in srgb, var(--accent, #f6a60a) 45%, transparent);
          animation-duration: 1.7s;
          inset: 10px;
        }
        .wms-ring-segment:nth-child(3) {
          border-top-color: color-mix(in srgb, var(--accent, #f6a60a) 22%, transparent);
          animation-duration: 2.3s;
          inset: 20px;
        }
        .wms-loading-text {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 5px;
          color: var(--text, #eef1f6);
          text-transform: uppercase;
        }
        .wms-dots span {
          animation: wms-blink 1.4s infinite;
          opacity: 0;
        }
        .wms-dots span:nth-child(1) { animation-delay: 0s; }
        .wms-dots span:nth-child(2) { animation-delay: 0.2s; }
        .wms-dots span:nth-child(3) { animation-delay: 0.4s; }
        .wms-loading-sub {
          font-size: 11px;
          letter-spacing: 3px;
          color: var(--muted, #7c8498);
          text-transform: uppercase;
          font-weight: 700;
        }
      `}</style>
      <div className="wms-loading-container">
        <div className="wms-loading-ring">
          <div className="wms-ring-segment" />
          <div className="wms-ring-segment" />
          <div className="wms-ring-segment" />
        </div>
        <div className="wms-loading-text">
          Loading<span className="wms-dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
        <div className="wms-loading-sub">WMS DLI Tambun</div>
      </div>
    </>
  );
}

export default function WarehouseApp() {
  const w = useWarehouse();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const canAccessAudit = w.user?.role === 'superadmin';
  const canAccessLaporan = w.user?.role === 'superadmin';

  if (w.loadingUser) {
    return <LoadingScreen />;
  }

  if (!w.user) {
    return (
      <>
        <style>{CSS}</style>
        <LoginScreen w={w} />
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <Sidebar w={w} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main">
          <Topbar w={w} onMenuClick={() => setSidebarOpen(o => !o)} />
          <div className="content">
            <Suspense fallback={<div className="empty-state" style={{ boxShadow: 'none' }}>Memuat halaman…</div>}>
              {w.activePage === 'dashboard' && <DashboardPage w={w} />}
              {w.activePage === 'produk' && <ProdukPage w={w} />}
              {w.activePage === 'toko' && <TokoPage w={w} />}
              {w.activePage === 'angkutan' && <AngkutanPage w={w} />}
              {w.activePage === 'masuk' && <MasukPage w={w} />}
              {w.activePage === 'keluar' && <KeluarPage w={w} />}
              {w.activePage === 'do' && <DOPage w={w} />}
              {w.activePage === 'cancel-do' && <CancelDOPage w={w} />}
              {w.activePage === 'pengiriman' && <PengirimanPage w={w} />}
              {w.activePage === 'setoran-sj' && <SetoranSJPage w={w} />}
              {w.activePage === 'tanda-terima' && <TandaTerimaPage w={w} />}
              {w.activePage === 'stok' && <StokPage w={w} />}
              {w.activePage === 'pallet' && <PalletPage w={w} />}
              {w.activePage === 'laporan' && canAccessLaporan ? <LaporanPage w={w} /> : null}
              {w.activePage === 'tonase' && <TonasePage w={w} />}
              {w.activePage === 'audit' && canAccessAudit ? <AuditPage w={w} /> : null}
              {w.activePage === 'whiteboard' && <WhiteboardPage w={w} />}
              {w.activePage === 'settings' && <SettingsPage w={w} />}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Global Toast */}
      {w.toast.show && (
        <div className={`toast ${w.toast.type === 'success' ? 'success' : 'error'}`}>
          {w.toast.type === 'success' ? '✅ ' : '❌ '}{w.toast.msg}
        </div>
      )}

      {/* Modals */}
      <ModalToko w={w} />
      <ModalAngkutan w={w} />
      <ModalDO w={w} />
      <ModalProduk w={w} />
      <ModalPengiriman w={w} />
      <ModalPallet w={w} />
      <ModalCatatan w={w} />
      <ModalPalletStok w={w} />
      <WhiteboardDetailModal w={w} />
    </>
  );
}