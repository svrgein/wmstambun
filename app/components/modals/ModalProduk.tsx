'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props { w: UseWarehouseReturn; }

export default function ModalProduk({ w }: Props) {
  if (!w.modalProduk) return null;
  return (
    <div className="modal-overlay" onClick={() => w.setModalProduk(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📦 Tambah Produk Semen</div>
          <button className="modal-close" onClick={() => w.setModalProduk(false)}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group full"><label>Nama Varian (Cth: Portland Composite)</label><input value={w.pNama} onChange={e => w.setPNama(e.target.value)} /></div>
          <div className="form-group"><label>Merk (Cth: Tiga Roda)</label><input value={w.pMerk} onChange={e => w.setPMerk(e.target.value)} /></div>
          <div className="form-group"><label>Berat per Zak (Kg)</label><input type="number" value={w.pBerat} onChange={e => w.setPBerat(e.target.value)} /></div>
          <div className="form-group full"><label>Stok Minimal Alert (Zak)</label><input type="number" value={w.pMinimal} onChange={e => w.setPMinimal(e.target.value)} /></div>
          <div className="form-group full"><label>Keterangan Tambahan</label><input value={w.pKet} onChange={e => w.setPKet(e.target.value)} /></div>
        </div>
        <button className="btn btn-primary w-full" style={{ marginTop: '20px', justifyContent: 'center' }} onClick={w.saveProduk}>Simpan Produk</button>
      </div>
    </div>
  );
}
