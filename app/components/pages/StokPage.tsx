'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function StokPage({ w }: Props) {
  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card orange"><div className="stat-label">Total Zak</div><div className="stat-val">{fmt(w.totalZak)}</div></div>
        <div className="stat-card blue"><div className="stat-label">Total Ton</div><div className="stat-val">{w.totalTon.toFixed(1)}</div></div>
        <div className="stat-card red"><div className="stat-label">Stok Kritis</div><div className="stat-val">{w.stokRendah.length}</div></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Produk</th><th>Merk</th><th>Berat/Zak</th><th>Stok (Zak)</th><th>Stok (Ton)</th><th>Min. Alert</th><th>Kondisi</th></tr></thead>
          <tbody>
            {w.products.map(p => (
              <tr key={p.id}>
                <td className="font-bold">{p.nama}</td>
                <td>{p.merk}</td>
                <td>{p.berat_per_zak} Kg</td>
                <td className="font-bold">{fmt(p.stok_zak)}</td>
                <td className="text-blue font-bold">{p.stok_ton}</td>
                <td>{fmt(p.stok_minimal)}</td>
                <td><span className={`badge ${p.stok_rendah ? 'b-red' : 'b-green'}`}>{p.stok_rendah ? 'KRITIS' : 'AMAN'}</span></td>
              </tr>
            ))}
            {w.products.length === 0 && <tr className="empty-row"><td colSpan={7}>Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
