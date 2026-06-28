'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props { w: UseWarehouseReturn; }

export default function ModalCatatan({ w }: Props) {
  if (!w.modalCatatan) return null;
  return (
    <div className="modal-overlay" onClick={() => w.setModalCatatan(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📝 {w.editingCatatan ? 'Edit Catatan' : 'Buat Catatan Baru'}</div>
          <button className="modal-close" onClick={() => w.setModalCatatan(false)}>✕</button>
        </div>
        <div className="form-group mb-16"><label>Judul</label><input value={w.cJudul} onChange={e => w.setCJudul(e.target.value)} placeholder="Cth: Jadwal Maintenance" /></div>
        <div className="form-group mb-16"><label>Isi Catatan</label><textarea value={w.cIsi} onChange={e => w.setCIsi(e.target.value)} style={{ minHeight: '120px' }} placeholder="Tulis catatan di sini..." /></div>
        <div className="form-group mb-16">
          <label>Warna Label</label>
          <div className="flex-row gap-12">
            {['#e8a045', '#5b8af5', '#4caf7d', '#e05252', '#a259f7', '#3a3f60'].map(color => (
              <div key={color} style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, cursor: 'pointer', border: w.cWarna === color ? '2px solid #fff' : '2px solid transparent', transform: w.cWarna === color ? 'scale(1.1)' : 'scale(1)' }} onClick={() => w.setCWarna(color)} />
            ))}
          </div>
        </div>
        <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={w.saveCatatan}>Simpan Catatan</button>
      </div>
    </div>
  );
}
