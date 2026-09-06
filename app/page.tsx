'use client';

import React from 'react';

// Hooks
import { useWarehouse } from '@/app/hooks/useWarehouse';

// Styles (disuntikkan ke head)
import { CSS } from '@/app/lib/constants';

// Layout & Core
import LoginScreen from '@/app/components/LoginScreen';
import Sidebar from '@/app/components/Sidebar';
import Topbar from '@/app/components/Topbar';

// Pages
import DashboardPage from '@/app/components/pages/DashboardPage';
import ProdukPage from '@/app/components/pages/ProdukPage';
import TokoPage from '@/app/components/pages/TokoPage';
import AngkutanPage from '@/app/components/pages/AngkutanPage';
import MasukPage from '@/app/components/pages/MasukPage';
import KeluarPage from '@/app/components/pages/KeluarPage';
import DOPage from '@/app/components/pages/DOPage';
import CancelDOPage from '@/app/components/pages/CancelDOPage';
import PengirimanPage from '@/app/components/pages/PengirimanPage';
import StokPage from '@/app/components/pages/StokPage';
import PalletPage from '@/app/components/pages/PalletPage';
import LaporanPage from '@/app/components/pages/LaporanPage';
import AuditPage from '@/app/components/pages/AuditPage';
import TonasePage from '@/app/components/pages/TonasePage';
import WhiteboardPage from '@/app/components/pages/WhiteboardPage';
import SettingsPage from '@/app/components/pages/SettingsPage';

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
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          background: radial-gradient(circle at center, #14161f 0%, #0b0d14 100%);
          color: #e8a045;
          font-family: 'Segoe UI', sans-serif;
        }
        .wms-loading-ring {
          position: relative;
          width: 80px;
          height: 80px;
        }
        .wms-ring-segment {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 4px solid transparent;
          border-top-color: #e8a045;
          animation: wms-spin 1.2s linear infinite;
        }
        .wms-ring-segment:nth-child(2) {
          border-top-color: rgba(232, 160, 69, 0.5);
          animation-duration: 1.8s;
          inset: 10px;
        }
        .wms-ring-segment:nth-child(3) {
          border-top-color: rgba(232, 160, 69, 0.25);
          animation-duration: 2.4s;
          inset: 20px;
        }
        .wms-loading-text {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 4px;
          text-shadow: 0 0 12px rgba(232, 160, 69, 0.6);
        }
        .wms-dots span {
          animation: wms-blink 1.4s infinite;
          opacity: 0;
        }
        .wms-dots span:nth-child(1) { animation-delay: 0s; }
        .wms-dots span:nth-child(2) { animation-delay: 0.2s; }
        .wms-dots span:nth-child(3) { animation-delay: 0.4s; }
        .wms-loading-sub {
          font-size: 12px;
          letter-spacing: 2px;
          color: rgba(232, 160, 69, 0.5);
          text-transform: uppercase;
        }
      `}</style>
      <div className="wms-loading-container">
        <div className="wms-loading-ring">
          <div className="wms-ring-segment" />
          <div className="wms-ring-segment" />
          <div className="wms-ring-segment" />
        </div>
        <div className="wms-loading-text">
          LOADING<span className="wms-dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
        <div className="wms-loading-sub">WMS DLI Tambun</div>
      </div>
    </>
  );
}

export default function WarehouseApp() {
  const w = useWarehouse();
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
        <Sidebar w={w} />
        <main className="main">
          <Topbar w={w} />
          <div className="content">
            {w.activePage === 'dashboard' && <DashboardPage w={w} />}
            {w.activePage === 'produk' && <ProdukPage w={w} />}
            {w.activePage === 'toko' && <TokoPage w={w} />}
            {w.activePage === 'angkutan' && <AngkutanPage w={w} />}
            {w.activePage === 'masuk' && <MasukPage w={w} />}
            {w.activePage === 'keluar' && <KeluarPage w={w} />}
            {w.activePage === 'do' && <DOPage w={w} />}
            {w.activePage === 'cancel-do' && <CancelDOPage w={w} />}
            {w.activePage === 'pengiriman' && <PengirimanPage w={w} />}
            {w.activePage === 'stok' && <StokPage w={w} />}
            {w.activePage === 'pallet' && <PalletPage w={w} />}
            {w.activePage === 'laporan' && canAccessLaporan ? <LaporanPage w={w} /> : null}
            {w.activePage === 'tonase' && <TonasePage w={w} />}
            {w.activePage === 'audit' && canAccessAudit ? <AuditPage w={w} /> : null}
            {w.activePage === 'whiteboard' && <WhiteboardPage w={w} />}
            {w.activePage === 'settings' && <SettingsPage w={w} />}
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
    </>
  );
}