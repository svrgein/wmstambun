'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

// Format: XXXX-XXXX-XX  (4 digit - 4 digit - 2 digit)
// Contoh: 0233-0250-09
function formatNoDO(raw: string): string {
  // Ambil hanya angka
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
}

export default function ModalDO({ w }: Props) {
  if (!w.modalDO) return null;

  const handleNoDO = (e: React.ChangeEvent<HTMLInputElement>) => {
    w.setDoNoDO(formatNoDO(e.target.value));
  };

  const isValidNoDO = /^\d{4}-\d{4}-\d{2}$/.test(w.doNoDO);
  const showHint = w.doNoDO.length > 0 && !isValidNoDO;

  return (
    <div className="modal-overlay" onClick={() => w.setModalDO(false)}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📋 Buat Delivery Order (DO) Baru</div>
          <button className="modal-close" onClick={() => w.setModalDO(false)}>✕</button>
        </div>
        <div className="form-grid" style={{ marginBottom: '16px' }}>
          <div className="form-group full">
            <label>No SDO</label>
            <input
              value={w.doNoDO}
              onChange={handleNoDO}
              placeholder="0233-0250-09"
              inputMode="numeric"
              maxLength={12}
              style={showHint ? { borderColor: 'var(--warn)' } : isValidNoDO && w.doNoDO ? { borderColor: 'var(--success)' } : {}}
            />
            {showHint && (
              <span style={{ fontSize: '11.5px', color: 'var(--warn)', marginTop: '5px', display: 'block', fontWeight: 600 }}>
                Format: 0233-0250-09 (4 digit - 4 digit - 2 digit)
              </span>
            )}
          </div>
          <div className="form-group full">
            <label>Toko Tujuan</label>
            <select value={w.doTokoId} onChange={e => w.setDoTokoId(e.target.value)}>
              <option value="">— Pilih Toko —</option>
              {w.tokos.map(t => <option key={t.id} value={t.id}>{t.nama} ({t.alamat})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Armada & Sopir</label>
            <select value={w.doAngkutanId} onChange={e => w.setDoAngkutanId(e.target.value)}>
              <option value="">— Pilih Armada —</option>
              {w.angkutans.map(a => <option key={a.id} value={a.id}>{a.nama_sopir} · {a.no_polisi} (Maks: {a.kapasitas_zak} zak)</option>)}
            </select>
          </div>
          <div className="form-group"><label>Tanggal Rencana Kirim</label><input type="date" value={w.doTanggal} onChange={e => w.setDoTanggal(e.target.value)} /></div>
          <div className="form-group full"><label>Catatan DO (Opsional)</label><input value={w.doCatatan} onChange={e => w.setDoCatatan(e.target.value)} /></div>
        </div>
        <hr className="divider" />
        <div className="section-title text-sm mb-12">Isi Muatan (Semen)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {w.doItems.map((item, i) => (
            <div key={i} className="do-item-row">
              <select value={item.produk_id} onChange={e => w.updateDoItem(i, 'produk_id', e.target.value)} style={{ flex: 1 }}>
                <option value="">— Pilih Produk Semen —</option>
                {w.products.map(p => <option key={p.id} value={p.id}>{p.merk} — {p.nama} (Stok: {fmt(p.stok_zak)})</option>)}
              </select>
              <input type="number" value={item.jumlah_zak || ''} onChange={e => w.updateDoItem(i, 'jumlah_zak', e.target.value)} placeholder="Jumlah Zak" style={{ width: '120px' }} />
              {w.doItems.length > 1 && <button className="btn btn-ghost" style={{ padding: '8px 10px' }} onClick={() => w.removeDoItem(i)}>✕</button>}
            </div>
          ))}
        </div>
        <button className="btn btn-ghost w-full mt-14" onClick={w.addDoItem}>+ Tambah Baris Muatan</button>
        <button className="btn btn-primary w-full mt-14" style={{ padding: '12px', justifyContent: 'center' }} onClick={w.saveDO}>Buat Surat Jalan (Draft DO)</button>
      </div>
    </div>
  );
}
