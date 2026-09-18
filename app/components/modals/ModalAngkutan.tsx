'use client';

import React from 'react';
import { Pencil, Truck, X } from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';

interface Props { w: UseWarehouseReturn; }

const groupHint = (nama: string): { label: string; cls: string } | null => {
  const n = nama.trim().toLowerCase();
  if (!n) return null;
  if (n.includes('gms')) return { label: 'Masuk grup GMS', cls: 'gms' };
  if (n.includes('tms')) return { label: 'Masuk grup TMS', cls: 'tms' };
  if (n.includes('imk')) return { label: 'Masuk grup IMK', cls: 'imk' };
  return { label: 'Tidak dikenali — masuk grup Lainnya', cls: 'oth' };
};

export default function ModalAngkutan({ w }: Props) {
  if (!w.modalAngkutan) return null;

  const close = () => { w.setEditingAngkutan(null); w.setModalAngkutan(false); };
  const hint = groupHint(w.aNama);

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              {w.editingAngkutan
                ? <><Pencil style={{ width: 16, height: 16, color: 'var(--accent)' }} /> Edit Angkutan & Supir</>
                : <><Truck style={{ width: 16, height: 16, color: 'var(--accent)' }} /> Tambah Angkutan & Supir</>}
            </div>
            <div className="text-xs text-muted" style={{ marginTop: 4 }}>
              {w.editingAngkutan ? 'Perbarui data truk / sopir di master armada.' : 'Truk baru otomatis terdaftar untuk absen harian.'}
            </div>
          </div>
          <button className="modal-close" onClick={close} aria-label="Tutup"><X style={{ width: 15, height: 15 }} /></button>
        </div>

        <div className="form-grid">
          <div className="form-group full">
            <label>Nama Sopir / PIC</label>
            <input value={w.aSopir} onChange={e => w.setASopir(e.target.value)} placeholder="Pak Budi" autoFocus={!w.editingAngkutan} />
          </div>
          <div className="form-group full">
            <label>Nama Kendaraan / PO</label>
            <input value={w.aNama} onChange={e => w.setANama(e.target.value)} placeholder="Cth: Truk Fuso 1, GMS-01, IMK 5…" />
            {hint && (
              <div className="flex-row" style={{ gap: '6px', marginTop: 7 }}>
                <span className={`fleet-tag ${hint.cls}`} style={{ width: 22, height: 22, fontSize: 8, borderRadius: 7 }}>
                  {hint.cls === 'gms' ? 'GMS' : hint.cls === 'tms' ? 'TMS' : hint.cls === 'imk' ? 'IMK' : 'LAIN'}
                </span>
                <span className="text-xs text-muted" style={{ fontWeight: 600 }}>{hint.label}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>No Polisi</label>
            <input value={w.aPolisi} onChange={e => w.setAPolisi(e.target.value)} placeholder="B 1234 CD" />
          </div>
          <div className="form-group">
            <label>Kapasitas Muat (Zak)</label>
            <input type="number" min={0} value={w.aKapasitas} onChange={e => w.setAKapasitas(e.target.value)} />
          </div>
          <div className="form-group full">
            <label>Status Saat Ini</label>
            <select value={w.aStatus} onChange={e => w.setAStatus(e.target.value as 'tersedia' | 'dalam_perjalanan' | 'maintenance' | 'tidak_aktif')}>
              {!['tersedia', 'dalam_perjalanan', 'maintenance'].includes(w.aStatus) && (
                <option value={w.aStatus} disabled>{w.aStatus}</option>
              )}
              <option value="tersedia">Tersedia / Ready</option>
              <option value="dalam_perjalanan">Dalam Perjalanan (DO)</option>
              <option value="maintenance">Maintenance / Rusak</option>
            </select>
          </div>
          <div className="form-group full">
            <label>Catatan</label>
            <input value={w.aCatatan} onChange={e => w.setACatatan(e.target.value)} placeholder="Cth: truk sering panas, sopir cadangan…" />
          </div>
        </div>

        <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button className="btn btn-ghost" onClick={close}>Batal</button>
          <button className="btn btn-primary" onClick={w.saveAngkutan}>
            {w.editingAngkutan ? 'Simpan Perubahan' : 'Tambah Angkutan'}
          </button>
        </div>
      </div>
    </div>
  );
}
