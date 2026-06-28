'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtTime } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function MasukPage({ w }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '20px' }}>
      <div className="card">
        <div className="card-title">Form Penerimaan Suplai</div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Jenis Semen</label>
            <select value={w.masukId} onChange={e => w.setMasukId(e.target.value)}>
              <option value="">— Pilih Semen —</option>
              {w.products.map(p => <option key={p.id} value={p.id}>{p.nama} ({p.berat_per_zak}kg)</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Jumlah Muatan (Ton)</label>
            <input type="number" step="0.1" value={w.masukQty} onChange={e => w.setMasukQty(e.target.value)} placeholder="Misal: 8.5" />
            {w.masukId && w.masukQty && (
              <div className="text-sm mt-14" style={{ marginTop: '4px', color: '#e8a045' }}>
                ℹ️ Setara dengan: <strong>{fmt(Math.round((Number(w.masukQty) * 1000) / (w.products.find(p => p.id === w.masukId)?.berat_per_zak || 50)))} Zak</strong>
              </div>
            )}
          </div>
          <div className="form-group"><label>No. Surat Jalan</label><input value={w.masukNoSurat} onChange={e => w.setMasukNoSurat(e.target.value)} placeholder="SJ-001" /></div>
          <div className="form-group full"><label>Supplier / Vendor</label><input value={w.masukSupplier} onChange={e => w.setMasukSupplier(e.target.value)} placeholder="PT Semen Indonesia Tbk" /></div>
          <div className="form-group full"><label>Keterangan</label><input value={w.masukKet} onChange={e => w.setMasukKet(e.target.value)} placeholder="Opsional" /></div>
        </div>
        <button className="btn btn-success w-full mt-14" style={{ marginTop: '14px', justifyContent: 'center' }} onClick={w.submitMasuk}>✅ Simpan Barang Masuk</button>
      </div>
      <div className="card">
        <div className="card-title">Log Masuk Hari Ini ({w.todayTrx.filter(t => t.jenis === 'masuk').length})</div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead><tr><th>Produk</th><th>Jumlah</th><th>Supplier</th><th>Jam</th></tr></thead>
            <tbody>
              {w.todayTrx.filter(t => t.jenis === 'masuk').map(t => (
                <tr key={t.id}>
                  <td>{t.produk?.merk} <span className="text-muted">{t.produk?.nama}</span></td>
                  <td className="font-bold text-success">+{fmt(t.jumlah_zak)} Sak</td>
                  <td>{t.pihak || '—'}</td>
                  <td>{fmtTime(t.tanggal)}</td>
                </tr>
              ))}
              {w.todayTrx.filter(t => t.jenis === 'masuk').length === 0 && <tr className="empty-row"><td colSpan={4}>Belum ada masuk hari ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
