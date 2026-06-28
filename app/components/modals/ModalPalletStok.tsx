'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props { w: UseWarehouseReturn; }

export default function ModalPalletStok({ w }: Props) {
  if (!w.modalPalletStok) return null;
  return (
    <div className="modal-overlay" onClick={() => w.setModalPalletStok(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">⚙️ Koreksi Stok Awal Pallet</div>
          <button className="modal-close" onClick={() => w.setModalPalletStok(false)}>✕</button>
        </div>
        <div className="alert alert-warn mb-16">
          ⚠️ Gunakan form ini HANYA untuk koreksi data atau saat awal setup. Sistem akan otomatis menghitung pergerakan pallet berdasarkan DO dan Log Pallet.
        </div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Total Keseluruhan Aset Pallet</label>
            <input type="number" value={w.psTotal} onChange={e => w.setPsTotal(e.target.value)} placeholder={w.palletStok?.total_pallet?.toString() || '0'} />
            <div className="text-xs text-muted mt-14" style={{ marginTop: '4px' }}>Berapa banyak pallet yang dimiliki perusahaan secara total.</div>
          </div>
          <div className="form-group">
            <label>Di Gudang (Kosong)</label>
            <input type="number" value={w.psStok} onChange={e => w.setPsStok(e.target.value)} placeholder={w.palletStok?.stok_gudang?.toString() || '0'} />
          </div>
          <div className="form-group">
            <label>Di Gudang (Isi Semen)</label>
            <input type="number" value={w.psPalletIsi} onChange={e => w.setPsPalletIsi(e.target.value)} placeholder={w.palletStok?.pallet_isi?.toString() || '0'} />
          </div>
          <div className="form-group full">
            <label>Dibawa Angkutan (Belum Tiba)</label>
            <input type="number" value={w.psPalletAngkutan} onChange={e => w.setPsPalletAngkutan(e.target.value)} placeholder={w.palletStok?.pallet_angkutan?.toString() || '0'} />
          </div>
          <div className="form-group full"><label>Keterangan Koreksi</label><input value={w.psKet} onChange={e => w.setPsKet(e.target.value)} placeholder="Alasan koreksi (opsional)" /></div>
        </div>
        <button className="btn btn-danger w-full mt-14" style={{ marginTop: '20px', justifyContent: 'center' }} onClick={w.savePalletStokGudang}>Simpan & Override Stok</button>
      </div>
    </div>
  );
}
