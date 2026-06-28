'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtDate, fmtTime } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function PalletPage({ w }: Props) {
  const bal = w.getPalletBalance();
  return (
    <div>
      <div className="section-header">
        <div className="section-title">Peredaran Pallet</div>
        <div className="flex-row">
          {w.user?.role === 'admin' && (
            <button className="btn btn-ghost btn-sm" onClick={() => w.setModalPalletStok(true)}>⚙ Kelola Stok Pallet</button>
          )}
          <button className="btn btn-purple" onClick={() => w.setModalPallet(true)}>+ Catat Pergerakan</button>
        </div>
      </div>

      {/* ── 5 stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '18px' }}>
        <div className="stat-card white">
          <div className="stat-label">Total Pallet</div>
          <div className="stat-val">{bal.total}</div>
          <div className="stat-sub">keseluruhan perusahaan</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Gudang — Kosong</div>
          <div className="stat-val" style={{ color: 'var(--success)' }}>{bal.kosong}</div>
          <div className="stat-sub">siap dipakai / dikirim</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Gudang — Isi Semen</div>
          <div className="stat-val" style={{ color: 'var(--accent2)' }}>{bal.isi}</div>
          <div className="stat-sub">sudah disiapkan muat</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Di Angkutan</div>
          <div className="stat-val" style={{ color: 'var(--warn)' }}>{bal.angkutan}</div>
          <div className="stat-sub">sedang dibawa truk</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Di Toko</div>
          <div className="stat-val" style={{ color: 'var(--accent3)' }}>{bal.toko}</div>
          <div className="stat-sub">deposit di mitra</div>
        </div>
      </div>

      {/* ── Balance bar + status ── */}
      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="flex-between" style={{ marginBottom: '10px' }}>
          <div className="card-title" style={{ margin: 0 }}>Distribusi Pallet</div>
          {bal.selisih !== 0
            ? <span className="badge b-red">⚠️ Selisih {bal.selisih} pallet — perlu koreksi</span>
            : <span className="badge b-green">✅ Balance ({bal.terpakai} / {bal.total})</span>
          }
        </div>
        {bal.total > 0 ? (
          <>
            <div className="balance-row" style={{ height: '16px', marginBottom: '10px' }}>
              {bal.kosong   > 0 && <div className="balance-seg" style={{ width: `${(bal.kosong   / bal.total) * 100}%`, background: 'var(--success)' }} title={`Gudang kosong: ${bal.kosong}`} />}
              {bal.isi      > 0 && <div className="balance-seg" style={{ width: `${(bal.isi      / bal.total) * 100}%`, background: 'var(--accent2)' }} title={`Gudang isi: ${bal.isi}`} />}
              {bal.angkutan > 0 && <div className="balance-seg" style={{ width: `${(bal.angkutan / bal.total) * 100}%`, background: 'var(--warn)' }} title={`Angkutan: ${bal.angkutan}`} />}
              {bal.toko     > 0 && <div className="balance-seg" style={{ width: `${(bal.toko     / bal.total) * 100}%`, background: 'var(--accent3)' }} title={`Toko: ${bal.toko}`} />}
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Gudang kosong', val: bal.kosong,   color: 'var(--success)', pct: bal.total > 0 ? ((bal.kosong   / bal.total) * 100).toFixed(1) : '0' },
                { label: 'Gudang isi',    val: bal.isi,      color: 'var(--accent2)', pct: bal.total > 0 ? ((bal.isi      / bal.total) * 100).toFixed(1) : '0' },
                { label: 'Angkutan',      val: bal.angkutan, color: 'var(--warn)',    pct: bal.total > 0 ? ((bal.angkutan / bal.total) * 100).toFixed(1) : '0' },
                { label: 'Toko',          val: bal.toko,     color: 'var(--accent3)', pct: bal.total > 0 ? ((bal.toko     / bal.total) * 100).toFixed(1) : '0' },
              ].map(({ label, val, color, pct }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--muted)' }}>{label}:</span>
                  <span style={{ fontWeight: 700, color }}>{val}</span>
                  <span style={{ color: 'var(--muted)' }}>({pct}%)</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="alert alert-warn" style={{ marginTop: '8px' }}>
            Stok pallet belum diisi. Klik "Kelola Stok Pallet" untuk mengisi data awal.
          </div>
        )}
      </div>

      {/* ── Saldo per toko ── */}
      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="card-title">Saldo Pallet per Toko</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {w.tokos.map(t => {
            const saldo = w.palletSaldoByToko(t.id);
            const pct = t.batas_pallet > 0 ? Math.min((saldo / t.batas_pallet) * 100, 100) : 0;
            const over = saldo > t.batas_pallet && t.batas_pallet > 0;
            return (
              <div key={t.id} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '14px', border: `1px solid ${over ? 'rgba(224,82,82,0.3)' : 'var(--border)'}` }}>
                <div className="font-bold text-sm">{t.nama}</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: over ? 'var(--danger)' : 'var(--accent3)', margin: '6px 0 4px' }}>{saldo}</div>
                <div className="pbar-wrap">
                  <div className="pbar" style={{ width: `${pct}%`, background: over ? 'var(--danger)' : 'var(--accent3)' }} />
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '5px' }}>
                  batas {t.batas_pallet} {over && <span style={{ color: 'var(--danger)' }}>· OVER!</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button className="btn btn-purple btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }} onClick={() => { w.setPlTokoId(t.id); w.setPlJenis('kembali'); w.setModalPallet(true); }}>← Kembali</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }} onClick={() => { w.setSelectedToko(t); w.setActivePage('toko'); }}>Detail</button>
                </div>
              </div>
            );
          })}
          {w.tokos.length === 0 && <div className="text-muted text-sm">Belum ada toko.</div>}
        </div>
      </div>

      {/* ── Log semua pallet ── */}
      <div className="card">
        <div className="card-title">Log Pergerakan Pallet (Semua Toko)</div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead><tr><th>Tanggal</th><th>Toko</th><th>Jenis</th><th>Jumlah</th><th>DO</th><th>Catatan</th></tr></thead>
            <tbody>
              {w.palletLogs.map(l => (
                <tr key={l.id}>
                  <td>{fmtDate(l.tanggal)} {fmtTime(l.tanggal)}</td>
                  <td className="font-bold">{l.toko?.nama || '—'}</td>
                  <td><span className={`badge ${l.jenis === 'keluar' ? 'b-keluar' : 'b-masuk'}`}>{l.jenis === 'keluar' ? '→ Ke Toko' : '← Kembali'}</span></td>
                  <td className="font-bold">{l.jumlah}</td>
                  <td style={{ fontFamily: 'monospace' }}>{w.deliveryOrders.find(d => d.id === l.do_id)?.no_do || '—'}</td>
                  <td className="text-muted">{l.catatan || '—'}</td>
                </tr>
              ))}
              {w.palletLogs.length === 0 && <tr className="empty-row"><td colSpan={6}>Belum ada log pallet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
