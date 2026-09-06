'use client';

import React, { useEffect, useState } from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtJakartaDateTime } from '@/app/lib/helpers';

interface Props {
  w: UseWarehouseReturn;
}

export default function Topbar({ w }: Props) {
  const [now, setNow] = useState(() => new Date());
  const canBackup = w.user?.role === 'superadmin';

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

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
        {w.activePage === 'cancel-do' && '↩️ List Cancel DO'}
        {w.activePage === 'pengiriman' && '🗺️ Pengiriman Bertahap'}
        {w.activePage === 'stok' && '📈 Monitor Stok Semen'}
        {w.activePage === 'pallet' && '🟫 Peredaran Pallet'}
        {w.activePage === 'laporan' && '📑 Riwayat Transaksi'}
        {w.activePage === 'tonase' && '📊 Tonase Harian'}
        {w.activePage === 'audit' && '🔍 Audit Log Perubahan'}
        {w.activePage === 'whiteboard' && '📝 Whiteboard Karyawan'}
        {w.activePage === 'settings' && '⚙️ Pengaturan Akun'}
      </div>
      <div className="flex-row">
        <span className="text-xs text-muted" title="Zona waktu aplikasi">{fmtJakartaDateTime(now)}</span>
        {w.isLoadingData
          ? <span style={{ fontSize: '12px', color: 'var(--accent)' }}>⟳ Syncing…</span>
          : <span style={{ fontSize: '12px', color: 'var(--muted)' }}><span className="live-dot" />Live</span>
        }
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            w.setActivePage('whiteboard');
            w.clearWhiteboardNotifications();
          }}
          title="Notifikasi catatan"
        >
          🔔{w.whiteboardNotifications.length > 0 ? ` ${w.whiteboardNotifications.length}` : ''}
        </button>
        {canBackup && <button className="btn btn-ghost btn-sm" onClick={() => void w.downloadBackup()} title="Unduh backup data">💾 Backup</button>}
        <button className="btn btn-ghost btn-sm" onClick={w.fetchAll}>↻ Refresh</button>
      </div>
    </div>
  );
}
