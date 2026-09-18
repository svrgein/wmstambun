'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, CalendarCheck2, ChevronRight, ClipboardList, Pencil,
  Plus, Search, Trash2, Truck, Users, Wrench,
} from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import type { Angkutan } from '@/app/lib/types';
import { fmt, fmtDate } from '@/app/lib/helpers';
import { statusAngkutanBadge, statusAngkutanLabel, statusDOBadge, statusDOLabel } from '@/app/lib/constants';
import AbsenHarianView from '@/app/components/pages/AbsenHarianView';

interface Props { w: UseWarehouseReturn; }

const FLEET_GROUPS = [
  { key: 'GMS', tag: 'GMS', title: 'Armada GMS', cls: 'gms' },
  { key: 'TMS', tag: 'TMS', title: 'Armada TMS', cls: 'tms' },
  { key: 'IMK', tag: 'IMK', title: 'Armada IMK', cls: 'imk' },
  { key: 'Lainnya', tag: 'LAIN', title: 'Armada Lainnya', cls: 'oth' },
] as const;

const initialOf = (name: string) => (name || '?').charAt(0).toUpperCase();

const statusAvatarCls = (s: Angkutan['status']) =>
  s === 'tersedia' ? 'st-ready'
    : s === 'dalam_perjalanan' ? 'st-away'
    : s === 'maintenance' ? 'st-down'
    : 'st-off';

function kpiCard(icon: React.ReactNode, iconCls: string, val: number, label: string) {
  return (
    <div className="armada-kpi">
      <div className={`armada-kpi-icon ${iconCls}`}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div className="armada-kpi-val">{fmt(val)}</div>
        <div className="armada-kpi-lbl">{label}</div>
      </div>
    </div>
  );
}

export default function AngkutanPage({ w }: Props) {
  const [view, setView] = useState<'absen' | 'master'>('absen');
  const [q, setQ] = useState('');

  const admin = w.user?.role === 'admin' || w.user?.role === 'superadmin';

  // ── Detail satu angkutan ──
  if (w.selectedAngkutan) {
    const a = w.selectedAngkutan;
    const aDO = w.deliveryOrders.filter(d => d.angkutan_id === a.id);
    const aDoAktif = aDO.find(d => d.status === 'proses');
    const totalZakDiantar = aDO.filter(d => d.status === 'selesai').reduce((s, d) => s + d.total_zak, 0);

    const statTile = (cls: string, label: string, val: React.ReactNode, sub?: string) => (
      <div className={`stat-card ${cls}`}>
        <div className="stat-label">{label}</div>
        <div className="stat-val">{val}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    );

    return (
      <div>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }} onClick={() => w.setSelectedAngkutan(null)}>
          <ArrowLeft style={{ width: 15, height: 15 }} /> Kembali ke Armada
        </button>

        <div className="card" style={{ marginBottom: '18px' }}>
          <div className="hero-detail">
            <div className={`hero-avatar ${statusAvatarCls(a.status)}`}>{initialOf(a.nama_sopir)}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="hero-name">
                {a.nama_sopir}
                <span className={`badge ${statusAngkutanBadge[a.status]}`} style={{ fontSize: '12px', padding: '4px 11px' }}>
                  {statusAngkutanLabel[a.status]}
                </span>
              </div>
              <div className="hero-sub">
                <span>{a.nama_angkutan}</span>
                {a.no_polisi && (<><span className="sep">·</span><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{a.no_polisi}</span></>)}
              </div>
              {a.catatan && (
                <div className="hero-note">📝 {a.catatan}</div>
              )}
            </div>
            {admin && (
              <div className="flex-row" style={{ gap: '8px', marginLeft: 'auto' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => w.openEditAngkutan(a)}>
                  <Pencil style={{ width: 13, height: 13 }} /> Edit
                </button>
                <button className="btn btn-danger-text btn-ghost btn-sm" onClick={() => w.deleteAngkutan(a.id)}>
                  <Trash2 style={{ width: 13, height: 13 }} /> Hapus
                </button>
              </div>
            )}
          </div>

          <div className="stat-grid mini">
            {statTile('blue', 'Kapasitas', fmt(a.kapasitas_zak), 'zak maksimal per rit')}
            {statTile('orange', 'Total DO', aDO.length, 'riwayat pengiriman')}
            {statTile('green', 'Zak Diantar', fmt(totalZakDiantar), 'dari DO selesai')}
          </div>

          {aDoAktif && (
            <div className="alert alert-warn" style={{ marginTop: '16px', flexWrap: 'wrap' }}>
              <Truck style={{ width: 16, height: 16, flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="text-xs" style={{ fontWeight: 800, opacity: 0.8, letterSpacing: '0.04em' }}>SEDANG MEMBAWA DO</div>
                <div className="flex-row" style={{ gap: '7px', flexWrap: 'wrap', marginTop: '3px' }}>
                  <b style={{ fontFamily: 'monospace' }}>{aDoAktif.no_do}</b>
                  <span style={{ opacity: 0.6 }}>→</span>
                  <span>{aDoAktif.toko?.nama || '—'}</span>
                </div>
              </div>
              <span className="badge b-warn" style={{ fontSize: '12px', padding: '5px 11px' }}>{fmt(aDoAktif.total_zak)} Zak</span>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <div className="card-title" style={{ margin: 0 }}>Riwayat DO ({aDO.length})</div>
          </div>
          <div className="table-wrap resp-table" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>No DO</th><th>Toko</th><th>Tanggal</th><th>Zak</th><th>Status</th></tr></thead>
              <tbody>
                {aDO.map(d => (
                  <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => { w.setSelectedDO(d); w.setActivePage('do'); }}>
                    <td data-label="No DO" className="font-bold text-accent" style={{ fontFamily: 'monospace' }}>{d.no_do}</td>
                    <td data-label="Toko">{d.toko?.nama || '—'}</td>
                    <td data-label="Tanggal">{fmtDate(d.tanggal)}</td>
                    <td data-label="Zak" className="font-bold">{fmt(d.total_zak)}</td>
                    <td data-label="Status"><span className={`badge ${statusDOBadge[d.status]}`}>{statusDOLabel[d.status]}</span></td>
                  </tr>
                ))}
                {aDO.length === 0 && <tr className="empty-row"><td colSpan={5}>Belum ada DO untuk armada ini.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Master armada (list) ──
  const renderMasterList = () => {
    const query = q.trim().toLowerCase();
    const match = (a: Angkutan) =>
      !query ||
      [a.nama_sopir, a.nama_angkutan, a.no_polisi || ''].some(s => s.toLowerCase().includes(query));

    const groups = FLEET_GROUPS.map(g => {
      const src = (w.angkutanGroups?.[g.key as keyof typeof w.angkutanGroups] || []) as Angkutan[];
      const items = src.filter(match);
      const jalan = items.filter(a => a.status === 'dalam_perjalanan').length;
      const maintenance = items.filter(a => a.status === 'maintenance').length;
      const off = items.filter(a => a.status === 'tidak_aktif').length;
      const siap = items.length - jalan - maintenance - off;
      return { ...g, src, items, siap, jalan, maintenance, off };
    });

    const visible = groups.reduce((s, g) => s + g.items.length, 0);
    const allReady = groups.reduce((s, g) => s + g.siap, 0);
    const allJalan = groups.reduce((s, g) => s + g.jalan, 0);
    const allMaint = groups.reduce((s, g) => s + g.maintenance, 0);
    const allOff = groups.reduce((s, g) => s + g.off, 0);

    return (
      <div>
        <div className="section-header">
          <div>
            <div className="section-title">Master Armada ({w.angkutans.length})</div>
            <div className="section-subtitle">Daftar truk, sopir & kendaraan pengiriman semen.</div>
          </div>
          {admin && (
            <button className="btn btn-primary" onClick={() => w.setModalAngkutan(true)}>
              <Plus style={{ width: 15, height: 15 }} /> Tambah Angkutan
            </button>
          )}
        </div>

        {w.angkutans.length === 0 ? (
          <div className="empty-state">
            <span className="empty-ic">🚚</span>
            Belum ada data armada. Klik <b>+ Tambah Angkutan</b> untuk mulai.
          </div>
        ) : (
          <>
            <div className="armada-kpis">
              {kpiCard(<Users style={{ width: 19, height: 19 }} />, 'kpi-icon-blue', w.angkutans.length, 'Total Armada')}
              {kpiCard(<Truck style={{ width: 19, height: 19 }} />, 'kpi-icon-green', allReady, 'Siap Berangkat')}
              {kpiCard(<ClipboardList style={{ width: 19, height: 19 }} />, 'kpi-icon-amber', allJalan, 'Sedang Jalan')}
              {kpiCard(<Wrench style={{ width: 19, height: 19 }} />, 'kpi-icon-red', allMaint + allOff, 'Maintenance / Off')}
            </div>

            <div className="fleet-toolbar">
              <div className="search-box">
                <Search />
                <input
                  type="text"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Cari nama sopir, kendaraan, atau no polisi…"
                  aria-label="Cari armada"
                />
              </div>
              <span className="text-sm text-muted">{visible} dari {w.angkutans.length} armada</span>
            </div>

            {groups.map(g => {
              if (g.items.length === 0) return null;
              const shown = !query ? g.src.length : g.items.length;
              return (
                <section className="fleet-group" key={g.key}>
                  <div className="fleet-group-head">
                    <div className={`fleet-tag ${g.cls}`}>{g.tag}</div>
                    <div>
                      <div className="fleet-group-name">{g.title}</div>
                      <div className="fleet-group-sub">{g.items.length} ditampilkan · {g.siap} siap · {g.jalan} jalan</div>
                    </div>
                    <div className="fleet-group-right">
                      <span className="text-xs text-muted" style={{ fontWeight: 700 }}>{shown} armada</span>
                    </div>
                  </div>

                  <div className="fleet-grid">
                    {g.items.map(a => (
                      <div className="truck-card" key={a.id}>
                        <div className="truck-card-top">
                          <div className={`truck-avatar ${statusAvatarCls(a.status)}`}>{initialOf(a.nama_sopir)}</div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="truck-title">{a.nama_sopir}</div>
                            <div className="truck-sub">{a.nama_angkutan}</div>
                          </div>
                          <span className={`badge ${statusAngkutanBadge[a.status]} truck-badge`}>{statusAngkutanLabel[a.status]}</span>
                        </div>
                        <div className="truck-meta">
                          {a.no_polisi ? (
                            <span className="meta-chip plate">{a.no_polisi}</span>
                          ) : (
                            <span className="meta-chip">Tanpa plat</span>
                          )}
                          <span className="meta-chip">
                            <Truck style={{ width: 12, height: 12 }} />
                            <b>{fmt(a.kapasitas_zak)}</b> zak
                          </span>
                        </div>
                        <div className="truck-actions">
                          {admin && (
                            <>
                              <button className="btn btn-ghost btn-sm icon-btn" title="Edit angkutan" onClick={() => w.openEditAngkutan(a)}>
                                <Pencil />
                              </button>
                              <button className="btn btn-ghost btn-sm icon-btn btn-danger-text" title="Hapus angkutan" onClick={() => w.deleteAngkutan(a.id)}>
                                <Trash2 />
                              </button>
                            </>
                          )}
                          <span className="spacer" />
                          <button className="btn btn-blue btn-sm" onClick={() => w.setSelectedAngkutan(a)}>
                            Detail <ChevronRight style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {visible === 0 && (
              <div className="empty-state">
                <span className="empty-ic">🔍</span>
                Tidak ada armada yang cocok dengan &quot;{q}&quot;.
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="tabs" style={{ marginBottom: '18px' }}>
        <button className={`tab${view === 'absen' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setView('absen')}>
          <CalendarCheck2 style={{ width: 14, height: 14, marginRight: 6, verticalAlign: -2 }} /> Absen Harian
        </button>
        <button className={`tab${view === 'master' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => { setView('master'); setQ(''); }}>
          <Truck style={{ width: 14, height: 14, marginRight: 6, verticalAlign: -2 }} /> Master Armada
        </button>
      </div>

      {view === 'absen' ? <AbsenHarianView w={w} /> : renderMasterList()}
    </div>
  );
}
