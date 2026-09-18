'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtTon, fmtDate } from '@/app/lib/helpers';
import { statusDOBadge, statusDOLabel } from '@/app/lib/constants';
import {
  AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Box, CalendarDays, ClipboardList,
  Factory, Layers, Truck,
} from 'lucide-react';

interface Props {
  w: UseWarehouseReturn;
}

export default function DashboardPage({ w }: Props) {
  const bal = w.getPalletBalance();
  const masukToday = w.todayTrx.filter(t => t.jenis === 'masuk');
  const keluarToday = w.todayTrx.filter(t => t.jenis === 'keluar');
  const masukTodayZak = masukToday.reduce((sum, t) => sum + t.jumlah_zak, 0);
  const keluarTodayZak = keluarToday.reduce((sum, t) => sum + t.jumlah_zak, 0);
  const masukTodayTon = w.todayTonIn;
  const keluarTodayTon = w.todayTonOut;

  const categoryOrder = ['GMS', 'TMS', 'IMK'] as const;
  const armadaStatus = categoryOrder.map(cat => {
    const items = w.angkutanGroups?.[cat] || [];
    const ready = items.filter(a => a.status === 'tersedia').length;
    return { cat, total: items.length, ready };
  });

  const totalPallet = bal.total || 1;

  const todayStr = new Date().toLocaleDateString('en-CA');
  const activeDOs = w.deliveryOrders.filter(d => d.status === 'proses' || (d.status === 'draft' && d.tanggal.startsWith(todayStr))).slice(0, 5);

  const userName = (w.user?.nama || 'Operator').split(' ')[0];
  const canManage = w.user?.role === 'admin' || w.user?.role === 'superadmin';

  const kpiTile = (
    key: string,
    icon: React.ReactNode,
    iconCls: string,
    numCls: string,
    label: string,
    value: string | number,
    foot: React.ReactNode,
  ) => (
    <div className="kpi" key={key}>
      <div className="flex-between">
        <span className="kpi-lbl">{label}</span>
        <div className={`kpi-ic ${iconCls}`}>{icon}</div>
      </div>
      <div className={`kpi-num ${numCls}`}>{value}</div>
      {foot && <div className="kpi-sub">{foot}</div>}
    </div>
  );

  const catStyle: Record<string, { bg: string; c: string }> = {
    GMS: { bg: 'rgba(53,207,122,0.16)', c: 'var(--success)' },
    TMS: { bg: 'rgba(246,166,10,0.16)', c: 'var(--warn)' },
    IMK: { bg: 'rgba(75,141,255,0.16)', c: 'var(--accent2)' },
  };

  const palletLegend = [
    { color: 'var(--success)', label: 'Gudang (Kosong)', val: bal.kosong },
    { color: 'var(--accent2)', label: 'Gudang (Isi Semen)', val: bal.isi },
    { color: 'var(--accent)', label: 'Di Angkutan', val: bal.angkutan },
    { color: 'var(--accent3)', label: 'Deposit Toko', val: bal.toko },
  ];

  return (
    <div>
      {/* Welcome band */}
      <div className="band">
        <div className="band-mark"><Factory /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="band-title">Halo, {userName}</div>
          <div className="band-sub">DLI Tambun · Ringkasan operasional gudang hari ini.</div>
        </div>
        <div className="band-meta">
          <span className="chip"><CalendarDays /> {fmtDate(new Date().toISOString())}</span>
          <span className="chip"><Box /> {fmt(bal.total)} Pallet</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-grid">
        {kpiTile(
          'stok', <Layers />, 'kpi-amber', 'amber',
          'Total Stok Semen', fmt(w.totalZak),
          <>{fmt(w.totalTon)} ton terpasang · {w.products.length} varian</>,
        )}
        {kpiTile(
          'do', <ClipboardList />, 'kpi-green', 'green',
          'Delivery Order Aktif', activeDOs.length,
          <>DO proses & surat jalan aktif</>,
        )}
        {kpiTile(
          'masuk', <ArrowDownToLine />, 'kpi-blue', 'blue',
          'Barang Masuk', masukToday.length,
          <><b>{fmt(masukTodayZak)} zak</b> · {fmtTon(masukTodayTon)} ton</>,
        )}
        {kpiTile(
          'keluar', <ArrowUpFromLine />, 'kpi-red', 'red',
          'Barang Keluar', keluarToday.length,
          <><b>{fmt(keluarTodayZak)} zak</b> · {fmtTon(keluarTodayTon)} ton</>,
        )}
      </div>

      {/* Stock + Pallet */}
      <div className="dash-grid-bento">
        <div className="dash-panel">
          <div className="dash-panel-title">
            Rincian Stok Semen
            <span className="badge b-gray">{fmt(w.totalZak)} zak</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {w.products.map(p => {
              const maxCap = 600;
              const pct = Math.min((p.stok_zak / maxCap) * 100, 100);
              const tonase = (p.stok_zak * p.berat_per_zak) / 1000;
              return (
                <div key={p.id}>
                  <div className="flex-between" style={{ gap: 12 }}>
                    <div className="flex-row" style={{ gap: 10, minWidth: 0 }}>
                      <span
                        style={{
                          width: 34, height: 34, borderRadius: 12, flexShrink: 0,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: 12, color: 'var(--text-sub)',
                          background: 'var(--card2)', boxShadow: 'var(--sh-press)',
                        }}
                      >
                        {p.merk[0]}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: p.stok_rendah ? 'var(--danger)' : 'var(--text)' }}>
                          {p.merk} {p.nama}
                        </span>
                        {p.stok_rendah && (
                          <span className="dash-badge red" style={{ marginLeft: 8 }}>Kritis</span>
                        )}
                      </span>
                    </div>
                    <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(p.stok_zak)}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--muted)', marginLeft: 6 }}>
                        / 600 zak · {fmtTon(tonase)} t
                      </span>
                    </span>
                  </div>
                  <div className="pbar-wrap" style={{ height: 10 }}>
                    <div className={`pbar ${p.stok_rendah ? 'red' : 'green'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {w.products.length === 0 && (
              <div className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>Belum ada produk semen.</div>
            )}
          </div>
        </div>

        {/* Pallet position */}
        <div className="dash-panel">
          <div className="dash-panel-title">
            Posisi Pallet
            {canManage && (
              <button className="btn btn-ghost btn-sm" onClick={() => w.setModalPalletStok(true)}>Kelola</button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%' }}>
            <div style={{ background: 'var(--card2)', borderRadius: 18, padding: '14px 18px', boxShadow: 'var(--sh-press)' }}>
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <span className="kpi-lbl">Total Pallet Terdaftar</span>
                <span className="kpi-lbl">Deposit terpantau</span>
              </div>
              <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(bal.total)}
              </div>
            </div>

            <div className="balance-row" style={{ height: 16, marginTop: 18 }}>
              {bal.kosong > 0 && <div className="balance-seg" style={{ width: `${(bal.kosong / totalPallet) * 100}%`, background: 'var(--success)' }} />}
              {bal.isi > 0 && <div className="balance-seg" style={{ width: `${(bal.isi / totalPallet) * 100}%`, background: 'var(--accent2)' }} />}
              {bal.angkutan > 0 && <div className="balance-seg" style={{ width: `${(bal.angkutan / totalPallet) * 100}%`, background: 'var(--accent)' }} />}
              {bal.toko > 0 && <div className="balance-seg" style={{ width: `${(bal.toko / totalPallet) * 100}%`, background: 'var(--accent3)' }} />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
              {palletLegend.map(l => (
                <div key={l.label} style={{ background: 'var(--card2)', padding: '11px 13px', borderRadius: 15, boxShadow: 'var(--sh-press)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: l.color, flexShrink: 0 }} />
                    {l.label}
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--text)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{fmt(l.val)}</div>
                </div>
              ))}
            </div>

            {bal.selisih !== 0 && (
              <div className="alert alert-warn" style={{ marginTop: 'auto' }}>
                <AlertTriangle style={{ width: 15, height: 15, flexShrink: 0 }} />
                <span>Terdapat selisih pallet terpantau: <b>{bal.selisih}</b></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DO + Armada */}
      <div className="dash-grid-bento">
        <div className="dash-panel">
          <div className="dash-panel-title">
            Status DO & Pengiriman Bertahap
            <button className="btn btn-primary btn-sm" onClick={() => w.setActivePage('pengiriman')}>Detail Pengiriman</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {activeDOs.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)' }}>
                Tidak ada DO aktif / proses saat ini.
              </div>
            ) : (
              activeDOs.map(d => {
                const terkirim = d.pengiriman?.reduce((s, p) => s + p.jumlah_zak, 0) || 0;
                const progress = d.total_zak > 0 ? (terkirim / d.total_zak) * 100 : 0;
                return (
                  <div key={d.id} style={{ padding: '13px 0', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="flex-between" style={{ alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div className="flex-row" style={{ gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)' }}>{d.no_do}</span>
                          <span className={`dash-badge ${statusDOBadge[d.status] === 'b-green' ? 'green' : 'yellow'}`}>
                            {statusDOLabel[d.status]}
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
                          {d.toko?.nama || 'Tanpa Toko'} — {d.angkutan?.nama_sopir || 'Tanpa Angkutan'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                          {fmt(terkirim)} <span style={{ fontSize: 11, color: 'var(--muted)' }}>/ {fmt(d.total_zak)} zak</span>
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, marginTop: 2 }}>Terkirim</div>
                      </div>
                    </div>
                    <div className="pbar-wrap" style={{ height: 8 }}>
                      <div className={`pbar ${progress >= 100 ? 'green' : ''}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Armada */}
        <div className="dash-panel">
          <div className="dash-panel-title">
            Kesiapan Armada
            <button className="btn btn-ghost btn-sm" onClick={() => w.setActivePage('angkutan')}>Lihat Sopir</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {armadaStatus.map(s => {
              const st = catStyle[s.cat] || catStyle.IMK;
              return (
                <div className="dash-list-item" key={s.cat}>
                  <div className="dash-avatar" style={{ background: st.bg, color: st.c, border: '1px solid transparent' }}>
                    {s.cat[0]}
                  </div>
                  <div className="dash-list-info">
                    <div className="dash-list-title">Grup {s.cat}</div>
                    <div className="dash-list-sub">{s.total} truk terdaftar</div>
                  </div>
                  <span className={`dash-badge ${s.ready === s.total && s.total > 0 ? 'green' : 'yellow'}`}>
                    {s.ready}/{s.total} ready
                  </span>
                </div>
              );
            })}
            {armadaStatus.every(s => s.total === 0) && (
              <div className="text-muted text-sm" style={{ padding: '12px 0' }}>Belum ada armada terdaftar.</div>
            )}
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card2)', borderRadius: 15, padding: '11px 14px', boxShadow: 'var(--sh-press)' }}>
              <Truck style={{ width: 16, height: 16, color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 700 }}>
                Total {w.angkutans.length} kendaraan di seluruh grup armada
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
