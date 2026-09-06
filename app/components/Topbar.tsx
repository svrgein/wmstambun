'use client';

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtJakartaDateTime, fmtAgo } from '@/app/lib/helpers';

interface Props {
  w: UseWarehouseReturn;
}

export default function Topbar({ w }: Props) {
  const [now, setNow] = useState(() => new Date());
  const [bellOpen, setBellOpen] = useState(false);
  const canBackup = w.user?.role === 'superadmin';

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const openNotification = (catatanId: string, notifId: string) => {
    w.markNotificationRead(notifId);
    w.setActivePage('whiteboard');
    w.setOpenWhiteboardNoteId(catatanId);
    setBellOpen(false);
  };

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
        <div className="tb-bell">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setBellOpen(o => !o)}
            title="Notifikasi whiteboard"
            aria-label="Notifikasi whiteboard"
            aria-expanded={bellOpen}
          >
            <Bell style={{ width: 15, height: 15 }} />
            {w.unreadWhiteboardCount > 0 && (
              <span className="tb-badge">{w.unreadWhiteboardCount > 9 ? '9+' : w.unreadWhiteboardCount}</span>
            )}
          </button>

          {bellOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 80 }} onClick={() => setBellOpen(false)} />
              <div className="tb-pop">
                <div className="tb-pop-head">
                  <span className="tb-pop-title">Notifikasi Whiteboard</span>
                  {w.unreadWhiteboardCount > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent2)' }}>
                      {w.unreadWhiteboardCount} baru
                    </span>
                  )}
                </div>
                <div className="tb-pop-list">
                  {w.whiteboardNotifications.length === 0 ? (
                    <div className="tb-pop-empty">Tidak ada notifikasi. Komentar atau @mention akan muncul di sini.</div>
                  ) : (
                    w.whiteboardNotifications.slice(0, 20).map(n => {
                      const read = w.wbReadIds.includes(n.id);
                      return (
                        <button
                          key={n.id}
                          className={`tb-pop-item${read ? '' : ' unread'}`}
                          onClick={() => openNotification(n.catatan_id, n.id)}
                        >
                          <span style={{ flexShrink: 0, marginTop: 2 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: read ? 'var(--border)' : 'var(--accent2)', display: 'inline-block' }} />
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="tb-pop-msg">{n.message}</span>
                            <div className="tb-pop-time">{fmtAgo(n.created_at)} · buka catatan</div>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
                {w.whiteboardNotifications.length > 0 && (
                  <div className="tb-pop-foot">
                    <button onClick={() => { w.clearWhiteboardNotifications(); setBellOpen(false); }}>
                      Tandai semua dibaca
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {canBackup && <button className="btn btn-ghost btn-sm" onClick={() => void w.downloadBackup()} title="Unduh backup data">💾 Backup</button>}
        <button className="btn btn-ghost btn-sm" onClick={w.fetchAll}>↻ Refresh</button>
      </div>
    </div>
  );
}
