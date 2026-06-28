'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props {
  w: UseWarehouseReturn;
}

export default function Topbar({ w }: Props) {
  return (
    <div className="topbar">
      <div style={{ fontWeight: 700, fontSize: '15px' }}>
        {w.activePage === 'dashboard' && '📊 Dashboard Realtime'}
        {w.activePage === 'produk' && '📦 Master Produk Semen'}
        {w.activePage === 'toko' && (w.selectedToko ? `🏪 ${w.selectedToko.nama}` : '🏪 Master Toko')}
        {w.activePage === 'angkutan' && (w.selectedAngkutan ? `🚚 ${w.selectedAngkutan.nama_sopir}` : '🚚 Master Angkutan')}
        {w.activePage === 'masuk' && '⬇️ Gate IN — Barang Masuk'}
        {w.activePage === 'keluar' && '⬆️ Gate OUT — Barang Keluar'}
        {w.activePage === 'do' && (w.selectedDO ? `📋 ${w.selectedDO.no_do}` : '📋 Delivery Order')}
        {w.activePage === 'pengiriman' && '🗺️ Pengiriman Bertahap'}
        {w.activePage === 'stok' && '📈 Monitor Stok Semen'}
        {w.activePage === 'pallet' && '🟫 Peredaran Pallet'}
        {w.activePage === 'laporan' && '📑 Riwayat Transaksi'}
        {w.activePage === 'audit' && '🔍 Audit Log Perubahan'}
        {w.activePage === 'whiteboard' && '📝 Whiteboard Karyawan'}
      </div>
      <div className="flex-row">
        {w.isLoadingData
          ? <span style={{ fontSize: '12px', color: 'var(--accent)' }}>⟳ Syncing…</span>
          : <span style={{ fontSize: '12px', color: 'var(--muted)' }}><span className="live-dot" />Live</span>
        }
        <button className="btn btn-ghost btn-sm" onClick={w.fetchAll}>↻ Refresh</button>
      </div>
    </div>
  );
}
