'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props { w: UseWarehouseReturn; }

export default function ModalAngkutan({ w }: Props) {
  if (!w.modalAngkutan) return null;
  return (
    <div className="modal-overlay" onClick={() => { w.setEditingAngkutan(null); w.setModalAngkutan(false); }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🚚 {w.editingAngkutan ? 'Edit' : 'Tambah'} Angkutan & Supir</div>
          <button className="modal-close" onClick={() => { w.setEditingAngkutan(null); w.setModalAngkutan(false); }}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group full"><label>Nama Sopir / PIC</label><input value={w.aSopir} onChange={e => w.setASopir(e.target.value)} placeholder="Pak Budi" /></div>
          <div className="form-group full"><label>Nama Kendaraan / PO</label><input value={w.aNama} onChange={e => w.setANama(e.target.value)} placeholder="Truk Fuso 1" /></div>
          <div className="form-group"><label>No Polisi</label><input value={w.aPolisi} onChange={e => w.setAPolisi(e.target.value)} placeholder="B 1234 CD" /></div>
          <div className="form-group"><label>Kapasitas Muat (Zak)</label><input type="number" value={w.aKapasitas} onChange={e => w.setAKapasitas(e.target.value)} /></div>
          <div className="form-group full">
            <label>Status Saat Ini</label>
            <select value={w.aStatus} onChange={e => w.setAStatus(e.target.value as any)}>
              <option value="tersedia">Tersedia</option>
              <option value="dalam_perjalanan">Dalam Perjalanan (DO)</option>
              <option value="maintenance">Maintenance / Rusak</option>
            </select>
          </div>
          <div className="form-group full"><label>Catatan</label><input value={w.aCatatan} onChange={e => w.setACatatan(e.target.value)} /></div>
        </div>
        <button className="btn btn-primary w-full" style={{ marginTop: '20px', justifyContent: 'center' }} onClick={w.saveAngkutan}>{w.editingAngkutan ? 'Perbarui' : 'Simpan'} Angkutan</button>
      </div>
    </div>
  );
}
