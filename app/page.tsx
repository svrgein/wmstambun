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
import PengirimanPage from '@/app/components/pages/PengirimanPage';
import StokPage from '@/app/components/pages/StokPage';
import PalletPage from '@/app/components/pages/PalletPage';
import LaporanPage from '@/app/components/pages/LaporanPage';
import AuditPage from '@/app/components/pages/AuditPage';
import WhiteboardPage from '@/app/components/pages/WhiteboardPage';

// Modals
import ModalProduk from '@/app/components/modals/ModalProduk';
import ModalToko from '@/app/components/modals/ModalToko';
import ModalAngkutan from '@/app/components/modals/ModalAngkutan';
import ModalDO from '@/app/components/modals/ModalDO';
import ModalPengiriman from '@/app/components/modals/ModalPengiriman';
import ModalPallet from '@/app/components/modals/ModalPallet';
import ModalCatatan from '@/app/components/modals/ModalCatatan';
import ModalPalletStok from '@/app/components/modals/ModalPalletStok';

export default function WarehouseApp() {
  const w = useWarehouse();

  if (w.loadingUser) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0d14', color: '#e8a045' }}>Memuat sistem...</div>;
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
            {w.activePage === 'dashboard'  && <DashboardPage w={w} />}
            {w.activePage === 'produk'     && <ProdukPage w={w} />}
            {w.activePage === 'toko'       && <TokoPage w={w} />}
            {w.activePage === 'angkutan'   && <AngkutanPage w={w} />}
            {w.activePage === 'masuk'      && <MasukPage w={w} />}
            {w.activePage === 'keluar'     && <KeluarPage w={w} />}
            {w.activePage === 'do'         && <DOPage w={w} />}
            {w.activePage === 'pengiriman' && <PengirimanPage w={w} />}
            {w.activePage === 'stok'       && <StokPage w={w} />}
            {w.activePage === 'pallet'     && <PalletPage w={w} />}
            {w.activePage === 'laporan'    && <LaporanPage w={w} />}
            {w.activePage === 'audit'      && <AuditPage w={w} />}
            {w.activePage === 'whiteboard' && <WhiteboardPage w={w} />}
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
