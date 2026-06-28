'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props { w: UseWarehouseReturn; }

export default function ModalToko({ w }: Props) {
  if (!w.modalToko) return null;
  return (
    <div className="modal-overlay" onClick={() => w.setModalToko(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🏪 Tambah Mitra Toko</div>
          <button className="modal-close" onClick={() => w.setModalToko(false)}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group full"><label>Nama Toko</label><input value={w.tNama} onChange={e => w.setTNama(e.target.value)} placeholder="Toko Bangunan Jaya" /></div>
          <div className="form-group"><label>Pemilik (PIC)</label><input value={w.tPemilik} onChange={e => w.setTPemilik(e.target.value)} /></div>
          <div className="form-group"><label>No HP / WA</label><input value={w.tHP} onChange={e => w.setTHP(e.target.value)} /></div>
          <div className="form-group full"><label>Batas Pinjam Pallet (Limit)</label><input type="number" value={w.tBatasPallet} onChange={e => w.setTBatasPallet(e.target.value)} placeholder="0" /></div>
          <div className="form-group full"><label>Alamat Pengiriman</label><textarea value={w.tAlamat} onChange={e => w.setTAlamat(e.target.value)} /></div>
          <div className="form-group full"><label>Catatan Khusus</label><input value={w.tCatatan} onChange={e => w.setTCatatan(e.target.value)} /></div>
        </div>
        <button className="btn btn-primary w-full" style={{ marginTop: '20px', justifyContent: 'center' }} onClick={w.saveToko}>Simpan Toko</button>
      </div>
    </div>
  );
}
