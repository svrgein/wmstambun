'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtDate, fmtTime } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function LaporanPage({ w }: Props) {
  return (
    <div>
      <div className="card" style={{ marginBottom: '18px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ minWidth: '130px' }}><label>Dari Tanggal</label><input type="date" value={w.filterDari} onChange={e => w.setFilterDari(e.target.value)} /></div>
          <div className="form-group" style={{ minWidth: '130px' }}><label>Sampai</label><input type="date" value={w.filterSampai} onChange={e => w.setFilterSampai(e.target.value)} /></div>
          <div className="form-group" style={{ minWidth: '130px' }}>
            <label>Jenis</label>
            <select value={w.filterJenis} onChange={e => w.setFilterJenis(e.target.value)}>
              <option value="">Semua</option>
              <option value="masuk">Masuk</option>
              <option value="keluar">Keluar</option>
            </select>
          </div>
          <div className="form-group" style={{ minWidth: '160px' }}>
            <label>Produk</label>
            <select value={w.filterProd} onChange={e => w.setFilterProd(e.target.value)}>
              <option value="">Semua Produk</option>
              {w.products.map(p => <option key={p.id} value={p.id}>{p.merk} — {p.nama}</option>)}
            </select>
          </div>
          <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Cetak</button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Tanggal</th><th>Jenis</th><th>Produk</th><th>Merk</th><th>Zak</th><th>Ton</th><th>No. Surat</th><th>Mitra</th><th>Petugas</th><th>Keterangan</th></tr></thead>
          <tbody>
            {w.filteredTrx.map(t => {
              const berat = t.produk?.berat_per_zak || 50;
              const ton = (t.jumlah_zak * berat) / 1000;
              return (
                <tr key={t.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(t.tanggal)} {fmtTime(t.tanggal)}</td>
                  <td><span className={`badge ${t.jenis === 'masuk' ? 'b-masuk' : 'b-keluar'}`}>{t.jenis === 'masuk' ? 'IN' : 'OUT'}</span></td>
                  <td>{t.produk?.nama}</td>
                  <td>{t.produk?.merk}</td>
                  <td className="font-bold">{fmt(t.jumlah_zak)}</td>
                  <td className="text-blue">{ton.toFixed(2)}</td>
                  <td style={{ fontFamily: 'monospace' }}>{t.no_surat || '—'}</td>
                  <td>{t.pihak || '—'}</td>
                  <td>{t.profiles?.nama || 'System'}</td>
                  <td className="text-muted">{t.keterangan || '—'}</td>
                </tr>
              );
            })}
            {w.filteredTrx.length === 0 && <tr className="empty-row"><td colSpan={10}>Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
