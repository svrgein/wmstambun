'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtTime } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function KeluarPage({ w }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '20px' }}>
      <div className="card">
        <div className="card-title">Form Pengeluaran Stok</div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Jenis Semen</label>
            <select value={w.keluarId} onChange={e => w.setKeluarId(e.target.value)}>
              <option value="">— Pilih Semen —</option>
              {w.products.map(p => <option key={p.id} value={p.id}>{p.nama} ({p.berat_per_zak}kg)</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Jumlah Muatan (Ton)</label>
            <input type="number" step="0.1" value={w.keluarQty} onChange={e => w.setKeluarQty(e.target.value)} placeholder="Misal: 8.5" />
            {w.keluarId && w.keluarQty && (
              <div className="text-sm mt-14" style={{ marginTop: '4px', color: '#e8a045' }}>
                ℹ️ Setara dengan: <strong>{fmt(Math.round((Number(w.keluarQty) * 1000) / (w.products.find(p => p.id === w.keluarId)?.berat_per_zak || 50)))} Zak</strong>
              </div>
            )}
          </div>
          <div className="form-group"><label>No. DO</label><input value={w.keluarNoSurat} onChange={e => w.setKeluarNoSurat(e.target.value)} placeholder="DO-001" /></div>
          <div className="form-group full"><label>Pembeli / Kontraktor</label><input value={w.keluarCustomer} onChange={e => w.setKeluarCustomer(e.target.value)} placeholder="Toko Sumber Jaya" /></div>
          <div className="form-group full"><label>Driver / Nopol</label><input value={w.keluarKet} onChange={e => w.setKeluarKet(e.target.value)} placeholder="Pak Dedi · B 9123 XX" /></div>
        </div>
        <button className="btn btn-danger w-full mt-14" style={{ marginTop: '14px', justifyContent: 'center' }} onClick={w.submitKeluar}>📤 Validasi Keluar</button>
      </div>
      <div className="card">
        <div className="card-title">Log Keluar Hari Ini ({w.todayTrx.filter(t => t.jenis === 'keluar').length})</div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead><tr><th>Produk</th><th>Jumlah</th><th>Tujuan</th><th>Jam</th></tr></thead>
            <tbody>
              {w.todayTrx.filter(t => t.jenis === 'keluar').map(t => (
                <tr key={t.id}>
                  <td>{t.produk?.merk} <span className="text-muted">{t.produk?.nama}</span></td>
                  <td className="font-bold text-danger">−{fmt(t.jumlah_zak)} Sak</td>
                  <td>{t.pihak || '—'}</td>
                  <td>{fmtTime(t.tanggal)}</td>
                </tr>
              ))}
              {w.todayTrx.filter(t => t.jenis === 'keluar').length === 0 && <tr className="empty-row"><td colSpan={4}>Belum ada keluar hari ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
