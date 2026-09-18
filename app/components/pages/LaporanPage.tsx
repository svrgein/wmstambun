'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtDate, fmtTime, fmtTon } from '@/app/lib/helpers';
import { downloadXlsx } from '@/app/lib/exportXlsx';
import { Download } from 'lucide-react';

interface Props { w: UseWarehouseReturn; }

export default function LaporanPage({ w }: Props) {
  const handleExportExcel = async () => {
    const headers = [
      { header: 'Tanggal', width: 13, align: 'center' as const },
      { header: 'Waktu', width: 10, align: 'center' as const },
      { header: 'Jenis', width: 9, align: 'center' as const },
      { header: 'Produk', width: 22 },
      { header: 'Merk', width: 14 },
      { header: 'Zak', width: 11, numFmt: '#,##0' },
      { header: 'Tonase', width: 12, numFmt: '#,##0.000' },
      { header: 'No. Surat', width: 18 },
      { header: 'Mitra / Customer', width: 26, wrap: true },
      { header: 'Petugas', width: 20 },
      { header: 'Keterangan', width: 44, wrap: true },
    ];

    const rows = w.filteredTrx.map(t => {
      const berat = t.produk?.berat_per_zak || 50;
      const ton = (t.jumlah_zak * berat) / 1000;
      return [
        fmtDate(t.tanggal),
        fmtTime(t.tanggal),
        t.jenis.toUpperCase(),
        t.produk?.nama || '',
        t.produk?.merk || '',
        t.jumlah_zak,
        Math.round(ton * 1000) / 1000,
        t.no_surat || '',
        t.pihak || '',
        t.profiles?.nama || 'System',
        t.keterangan || '',
      ];
    });

    try {
      await downloadXlsx(`Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.xlsx`, [
        { name: 'Riwayat Transaksi', cols: headers, rows, banded: true },
      ]);
      w.triggerToast('File Excel (.xlsx) berhasil diunduh.');
    } catch {
      w.triggerToast('Gagal membuat file Excel. Silakan coba lagi.');
    }
  };

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
          <button className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleExportExcel}>
            <Download size={16} /> Export Excel
          </button>
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
                  <td className="text-blue">{fmtTon(ton)}</td>
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
