'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtDate } from '@/app/lib/helpers';
import { statusDOBadge, statusDOLabel, statusAngkutanBadge, statusAngkutanLabel } from '@/app/lib/constants';

interface Props {
  w: UseWarehouseReturn;
}

export default function DashboardPage({ w }: Props) {
  const bal = w.getPalletBalance();

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card orange"><div className="stat-label">Jenis Semen</div><div className="stat-val">{w.products.length}</div><div className="stat-sub">varian aktif</div></div>
        <div className="stat-card blue"><div className="stat-label">Total Stok</div><div className="stat-val">{fmt(w.totalZak)}</div><div className="stat-sub">zak · {w.totalTon.toFixed(1)} ton</div></div>
        <div className="stat-card red"><div className="stat-label">Stok Kritis</div><div className="stat-val">{w.stokRendah.length}</div><div className="stat-sub">item perlu restock</div></div>
        <div className="stat-card green"><div className="stat-label">DO Hari Ini</div><div className="stat-val">{w.todayDO.length}</div><div className="stat-sub">surat jalan</div></div>
        <div className="stat-card yellow"><div className="stat-label">Truk Jalan</div><div className="stat-val">{w.angkutanJalan.length}</div><div className="stat-sub">dalam perjalanan</div></div>
        <div className="stat-card purple"><div className="stat-label">Mitra Toko</div><div className="stat-val">{w.tokos.length}</div><div className="stat-sub">toko terdaftar</div></div>
      </div>

      {/* Pallet ringkasan dashboard */}
      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="flex-between mb-12" style={{ marginBottom: '12px' }}>
          <div className="card-title" style={{ margin: 0 }}>🟫 Posisi Pallet Saat Ini</div>
          {w.user?.role === 'admin' && (
            <button className="btn btn-ghost btn-sm" onClick={() => w.setModalPalletStok(true)}>⚙ Kelola Stok Pallet</button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          {[
            { label: 'Total Pallet', val: bal.total, color: 'var(--text)', sub: 'keseluruhan' },
            { label: 'Gudang (Kosong)', val: bal.kosong, color: 'var(--success)', sub: 'siap pakai' },
            { label: 'Gudang (Isi Semen)', val: bal.isi, color: 'var(--accent2)', sub: 'sudah disiapkan' },
            { label: 'Di Angkutan', val: bal.angkutan, color: 'var(--warn)', sub: 'dibawa truk' },
            { label: 'Di Toko', val: bal.toko, color: 'var(--accent3)', sub: 'deposit mitra' },
          ].map(({ label, val, color, sub }) => (
            <div key={label} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px 14px', border: '1px solid var(--border)' }}>
              <div className="text-xs text-muted">{label}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color, margin: '4px 0 2px' }}>{val}</div>
              <div className="text-xs text-muted">{sub}</div>
            </div>
          ))}
        </div>
        {bal.total > 0 && (
          <>
            <div className="balance-row">
              {bal.kosong > 0 && <div className="balance-seg" style={{ width: `${(bal.kosong / bal.total) * 100}%`, background: 'var(--success)' }} />}
              {bal.isi > 0 && <div className="balance-seg" style={{ width: `${(bal.isi / bal.total) * 100}%`, background: 'var(--accent2)' }} />}
              {bal.angkutan > 0 && <div className="balance-seg" style={{ width: `${(bal.angkutan / bal.total) * 100}%`, background: 'var(--warn)' }} />}
              {bal.toko > 0 && <div className="balance-seg" style={{ width: `${(bal.toko / bal.total) * 100}%`, background: 'var(--accent3)' }} />}
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--success)' }}>■ Gudang kosong ({bal.kosong})</span>
              <span style={{ color: 'var(--accent2)' }}>■ Gudang isi ({bal.isi})</span>
              <span style={{ color: 'var(--warn)' }}>■ Angkutan ({bal.angkutan})</span>
              <span style={{ color: 'var(--accent3)' }}>■ Toko ({bal.toko})</span>
              {bal.selisih !== 0 && <span style={{ color: 'var(--danger)', fontWeight: 700 }}>⚠️ Selisih: {bal.selisih}</span>}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
        {/* Kapasitas stok */}
        <div className="card">
          <div className="card-title">Kapasitas Stok per Jenis</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {w.products.map(p => {
              const pct = Math.min((p.stok_zak / 600) * 100, 100);
              const tonase = (p.stok_zak * p.berat_per_zak) / 1000;
              return (
                <div key={p.id}>
                  <div className="flex-between text-sm" style={{ marginBottom: '4px' }}>
                    <span>{p.merk} — {p.nama}</span>
                    <span className="font-bold">{tonase % 1 === 0 ? tonase : tonase.toFixed(1)} Ton ({fmt(p.stok_zak)} Zak)</span>
                  </div>
                  <div className="pbar-wrap">
                    <div className="pbar" style={{ width: `${pct}%`, background: p.stok_rendah ? 'var(--danger)' : 'var(--accent)' }} />
                  </div>
                </div>
              );
            })}
            {w.products.length === 0 && <div className="text-muted text-sm">Belum ada produk.</div>}
          </div>
        </div>
        {/* Armada */}
        <div className="card">
          <div className="card-title">Status Armada Angkutan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {w.angkutans.map(a => {
              const doAktif = w.deliveryOrders.find(d => d.angkutan_id === a.id && d.status === 'proses');
              return (
                <div key={a.id} style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div className="flex-between">
                    <div>
                      <div className="font-bold text-sm">{a.nama_sopir}</div>
                      <div className="text-muted text-xs">{a.no_polisi || '—'} · {fmt(a.kapasitas_zak)} zak maks</div>
                    </div>
                    <span className={`badge ${statusAngkutanBadge[a.status]}`}>{statusAngkutanLabel[a.status]}</span>
                  </div>
                  {doAktif && <div style={{ marginTop: '6px', fontSize: '11.5px', color: 'var(--accent)' }}>📋 {doAktif.no_do} → {doAktif.toko?.nama}</div>}
                </div>
              );
            })}
            {w.angkutans.length === 0 && <div className="text-muted text-sm">Belum ada angkutan.</div>}
          </div>
        </div>
      </div>

      {/* DO hari ini */}
      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="flex-between mb-12" style={{ marginBottom: '12px' }}>
          <div className="card-title" style={{ margin: 0 }}>DO Hari Ini</div>
          <button className="btn btn-primary btn-sm" onClick={() => w.setModalDO(true)}>+ Buat DO</button>
        </div>
        {w.todayDO.length === 0
          ? <div className="text-muted text-sm">Belum ada DO hari ini.</div>
          : (
            <div className="table-wrap" style={{ border: 'none' }}>
              <table>
                <thead><tr><th>No DO</th><th>Toko</th><th>Angkutan</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {w.todayDO.map(d => (
                    <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => { w.setSelectedDO(d); w.setActivePage('do'); }}>
                      <td className="font-bold text-accent">{d.no_do}</td>
                      <td>{d.toko?.nama || '—'}</td>
                      <td>{d.angkutan?.nama_sopir || '—'}</td>
                      <td>{fmt(d.total_zak)} zak</td>
                      <td><span className={`badge ${statusDOBadge[d.status]}`}>{statusDOLabel[d.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {w.stokRendah.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ color: 'var(--danger)' }}>🚨 Alert Stok Kritis</div>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>Produk</th><th>Stok</th><th>Minimal</th><th>Aksi</th></tr></thead>
              <tbody>
                {w.stokRendah.map(p => (
                  <tr key={p.id}>
                    <td>{p.merk} — {p.nama}</td>
                    <td className="font-bold text-danger">{fmt(p.stok_zak)} Zak</td>
                    <td>{fmt(p.stok_minimal)} Zak</td>
                    <td><button className="btn btn-blue btn-sm" onClick={() => { w.setMasukId(p.id); w.setActivePage('masuk'); }}>Restock ⬇️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
