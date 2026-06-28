'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function ProdukPage({ w }: Props) {
  return (
    <div>
      <div className="section-header">
        <div className="section-title">Produk Semen ({w.products.length})</div>
        {w.user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => w.setModalProduk(true)}>+ Tambah Produk</button>
        )}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nama Produk</th><th>Merk</th><th>Berat/Zak</th><th>Stok (Zak)</th><th>Stok (Ton)</th><th>Min. Alert</th><th>Status</th></tr></thead>
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
            {w.products.length === 0 && <tr className="empty-row"><td colSpan={7}>Belum ada produk.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
