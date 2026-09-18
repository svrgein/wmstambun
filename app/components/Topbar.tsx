'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowDownToLine, ArrowUpFromLine, BarChart2, Bell, Box,
  ClipboardCheck, ClipboardList, Download, History, LayoutDashboard, Loader2, Map,
  Menu, Package, PenTool, Receipt, RotateCcw, RotateCw, Search, Settings,
  Store, Truck, Weight,
} from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtDate, today } from '@/app/lib/helpers';

interface Props {
  w: UseWarehouseReturn;
  onMenuClick: () => void;
}

const PAGE_META: Record<string, { icon: React.ReactNode; label: string; crumb: string }> = {
  dashboard:   { icon: <LayoutDashboard />, label: 'Dashboard',         crumb: 'Ringkasan operasional gudang' },
  produk:      { icon: <Package />,         label: 'Produk Semen',      crumb: 'Master Data' },
  toko:        { icon: <Store />,           label: 'Master Toko',       crumb: 'Master Data' },
  angkutan:    { icon: <Truck />,           label: 'Master Angkutan',   crumb: 'Armada & Sopir' },
  masuk:       { icon: <ArrowDownToLine />, label: 'Barang Masuk',      crumb: 'Operasional' },
  keluar:      { icon: <ArrowUpFromLine />, label: 'Barang Keluar',     crumb: 'Operasional' },
  do:          { icon: <ClipboardList />,   label: 'Delivery Order',    crumb: 'DO / Surat Jalan' },
  'cancel-do': { icon: <RotateCcw />,       label: 'Cancel DO',         crumb: 'Pembatalan' },
  'setoran-sj': { icon: <ClipboardCheck />,  label: 'Setoran Surat Jalan', crumb: 'Administrasi · Penyetoran SJ' },
  pengiriman:     { icon: <Map />,             label: 'Pengiriman',          crumb: 'Pengiriman Bertahap' },
  'tanda-terima': { icon: <Receipt />,         label: 'Tanda Terima DO',     crumb: 'Buku Tanda Terima · GMS / TMS / IMK' },
  stok:        { icon: <BarChart2 />,       label: 'Monitor Stok',      crumb: 'Monitoring' },
  pallet:      { icon: <Box />,             label: 'Peredaran Pallet',  crumb: 'Monitoring' },
  tonase:      { icon: <Weight />,          label: 'Tonase Harian',     crumb: 'Monitoring' },
  laporan:     { icon: <History />,         label: 'Riwayat Transaksi', crumb: 'Laporan' },
  audit:       { icon: <Search />,          label: 'Audit Log',         crumb: 'Supervisi' },
  whiteboard:  { icon: <PenTool />,         label: 'Whiteboard',        crumb: 'Catatan Tim' },
  settings:    { icon: <Settings />,        label: 'Pengaturan',        crumb: 'Preferensi' },
};

export default function Topbar({ w, onMenuClick }: Props) {
  const [now, setNow] = useState(() => new Date());
  const [bellOpen, setBellOpen] = useState(false);
  const canBackup = w.user?.role === 'superadmin';
  const [ttAlerts, setTtAlerts] = useState({ pending: 0, blomSetor: 0, telatSetor: 0, perluDicek: 0 });

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Alert tanda terima (fetch ringan, refresh tiap 60s / pas pindah halaman / selesai sync)
  useEffect(() => {
    let on = true;
    const load = async () => {
      const { data } = await w.supabase.from('tanda_terima')
        .select('print_date,status_kirim,status_setoran,cek_angkutan,delv_date').limit(5000);
      if (!on || !data) return;
      const t = today();
      let pending = 0, blomSetor = 0, telatSetor = 0, perluDicek = 0;
      data.forEach((r: { print_date: string; status_kirim: string; status_setoran: string; cek_angkutan: string; delv_date: string | null }) => {
        if (r.cek_angkutan === 'belum') perluDicek += 1;
        if (r.print_date < t && (r.status_kirim === 'belum' || r.status_kirim === 'tunggu_info')) pending += 1;
        if (r.status_kirim === 'terkirim' && r.status_setoran === 'belum') {
          blomSetor += 1;
          if (r.delv_date) {
            const d = Math.round((Date.parse(t + 'T12:00:00') - Date.parse(r.delv_date + 'T12:00:00')) / 86400000);
            if (d > 2) telatSetor += 1;
          }
        }
      });
      setTtAlerts({ pending, blomSetor, telatSetor, perluDicek });
    };
    void load();
    const id = window.setInterval(load, 60000);
    return () => { on = false; window.clearInterval(id); };
  }, [w.activePage, w.isLoadingData, w.supabase]);

  const meta = PAGE_META[w.activePage] || PAGE_META.dashboard;
  let label = meta.label;
  if (w.activePage === 'toko' && w.selectedToko) label = w.selectedToko.nama;
  if (w.activePage === 'angkutan' && w.selectedAngkutan) label = w.selectedAngkutan.nama_sopir;
  if (w.activePage === 'do' && w.selectedDO) label = w.selectedDO.no_do;

  const dayLine = fmtDate(now.toISOString());
  const timeStr = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(now);

  const openNotification = (catatanId: string, notifId: string) => {
    w.markNotificationRead(notifId);
    w.setActivePage('whiteboard');
    w.setOpenWhiteboardNoteId(catatanId);
    setBellOpen(false);
  };

  const ttTotal = ttAlerts.pending + ttAlerts.blomSetor + ttAlerts.perluDicek;
  const openTt = () => { w.setActivePage('tanda-terima'); setBellOpen(false); };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          className="btn btn-ghost btn-sm hamburger-btn"
          onClick={onMenuClick}
          aria-label="Buka menu navigasi"
        >
          <Menu style={{ width: 18, height: 18 }} />
        </button>
        <div className="tb-icon-chip">{meta.icon}</div>
        <div style={{ minWidth: 0 }}>
          <div className="topbar-title">{label}</div>
          <div className="topbar-title-sub">{meta.crumb}</div>
        </div>
      </div>
      <div className="topbar-right">
        <span className="tb-pill topbar-datetime" title="Zona waktu Asia/Jakarta (WIB)">
          <span className="tb-hide-sm">{dayLine} · </span>
          <b>{timeStr}</b>
          <span> WIB</span>
        </span>
        {w.isLoadingData
          ? (
            <span className="tb-pill topbar-live">
              <Loader2 className="tb-spin" style={{ width: 13, height: 13 }} />
              Sync…
            </span>
          )
          : (
            <span className="tb-pill topbar-live">
              <span className="live-dot" />
              <span className="tb-hide-sm">Live</span>
            </span>
          )
        }
        <div className="tb-bell">
          <button
            className="btn btn-ghost btn-sm icon-btn"
            onClick={() => setBellOpen(o => !o)}
            title="Notifikasi whiteboard"
            aria-label="Notifikasi whiteboard"
            aria-expanded={bellOpen}
          >
            <Bell />
            {(w.unreadWhiteboardCount > 0 || ttTotal > 0) && (
              <span className="tb-badge">
                {(w.unreadWhiteboardCount + ttTotal) > 9 ? '9+' : (w.unreadWhiteboardCount + ttTotal)}
              </span>
            )}
          </button>

          {bellOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 80 }} onClick={() => setBellOpen(false)} />
              <div className="tb-pop">
                {ttTotal > 0 && (
                  <>
                    <div className="tb-pop-head">
                      <span className="tb-pop-title">Tanda Terima DO</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--danger)' }}>{ttTotal} perlu perhatian</span>
                    </div>
                    <div className="tb-pop-list">
                      {ttAlerts.pending > 0 && (
                        <button className="tb-pop-item unread" onClick={openTt}>
                          <span style={{ flexShrink: 0, marginTop: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} /></span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="tb-pop-msg">⚡ {ttAlerts.pending} DO tertunda belum kirim</span>
                            <div className="tb-pop-time">lewat tanggal print · buka Tanda Terima</div>
                          </span>
                        </button>
                      )}
                      {ttAlerts.blomSetor > 0 && (
                        <button className="tb-pop-item unread" onClick={openTt}>
                          <span style={{ flexShrink: 0, marginTop: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warn)', display: 'inline-block' }} /></span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="tb-pop-msg">💰 {ttAlerts.blomSetor} DO sudah kirim belum disetor{ttAlerts.telatSetor > 0 ? ` · ${ttAlerts.telatSetor} telat` : ''}</span>
                            <div className="tb-pop-time">telat setor {'>'} 2 hari · buka Tanda Terima</div>
                          </span>
                        </button>
                      )}
                      {ttAlerts.perluDicek > 0 && (
                        <button className="tb-pop-item unread" onClick={openTt}>
                          <span style={{ flexShrink: 0, marginTop: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent2)', display: 'inline-block' }} /></span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="tb-pop-msg">🔍 {ttAlerts.perluDicek} DO angkutan belum dicek</span>
                            <div className="tb-pop-time">double-check vs distributor · buka Tanda Terima</div>
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                )}
                <div className="tb-pop-head">
                  <span className="tb-pop-title">Notifikasi Whiteboard</span>
                  {w.unreadWhiteboardCount > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent2)' }}>
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
                          <span style={{ flexShrink: 0, marginTop: 5 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: read ? 'var(--border2)' : 'var(--accent2)', display: 'inline-block' }} />
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="tb-pop-msg">{n.message}</span>
                            <div className="tb-pop-time">{fmtDate(n.created_at)} · buka catatan</div>
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
        {canBackup && (
          <button className="btn btn-ghost btn-sm" onClick={() => void w.downloadBackup()} title="Unduh backup data">
            <Download style={{ width: 15, height: 15 }} /> <span className="tb-hide-sm">Backup</span>
          </button>
        )}
        <button className="btn btn-ghost btn-sm icon-btn" onClick={w.fetchAll} title="Muat ulang data" aria-label="Muat ulang data">
          <RotateCw style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  );
}
