'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props { w: UseWarehouseReturn; }

export default function ModalPallet({ w }: Props) {
  if (!w.modalPallet) return null;
  return (
    <div className="modal-overlay" onClick={() => w.setModalPallet(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🟫 Catat Pergerakan Pallet</div>
          <button className="modal-close" onClick={() => w.setModalPallet(false)}>✕</button>
        </div>
        <div className="tabs">
          <button className={`tab ${w.plJenis === 'keluar' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => w.setPlJenis('keluar')}>→ Keluar ke Toko</button>
          <button className={`tab ${w.plJenis === 'kembali' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => w.setPlJenis('kembali')}>← Kembali ke Gudang</button>
        </div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Toko (Mitra)</label>
            <select value={w.plTokoId} onChange={e => w.setPlTokoId(e.target.value)}>
              <option value="">— Pilih Toko —</option>
              {w.tokos.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
            </select>
          </div>
          <div className="form-group full">
            <label>Terkait DO (Opsional)</label>
            <select value={w.plDoId} onChange={e => w.setPlDoId(e.target.value)}>
              <option value="">— Tidak Terikat DO —</option>
              {w.deliveryOrders.map(d => <option key={d.id} value={d.id}>{d.no_do} → {d.toko?.nama}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Jumlah Pallet</label><input type="number" value={w.plJumlah} onChange={e => w.setPlJumlah(e.target.value)} /></div>
          <div className="form-group"><label>Catatan</label><input value={w.plCatatan} onChange={e => w.setPlCatatan(e.target.value)} placeholder="Kondisi pallet dll" /></div>
        </div>
        <button className="btn btn-purple w-full" style={{ marginTop: '20px', justifyContent: 'center' }} onClick={w.savePalletLog}>Simpan Log Pallet</button>
      </div>
    </div>
  );
}
