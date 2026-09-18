'use client';

import React, { useState } from 'react';
import { Check, Pencil, Truck, X } from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import type { AbsenHarian } from '@/app/lib/types';

interface Props {
  w: UseWarehouseReturn;
  tanggal: string;
  editing: AbsenHarian | null; // null => tambah supir bantuan baru
  onClose: () => void;
}

export default function ModalAbsen({ w, tanggal, editing, onClose }: Props) {
  const isBantuan = !editing || editing.jenis === 'bantuan';
  const isEdit = Boolean(editing);

  const [namaSopir, setNamaSopir] = useState(editing?.nama_sopir ?? '');
  const [namaAngkutan, setNamaAngkutan] = useState(editing?.nama_angkutan ?? '');
  const [noPolisi, setNoPolisi] = useState(editing?.no_polisi ?? '');
  const [kapasitas, setKapasitas] = useState(editing?.kapasitas_zak ? String(editing.kapasitas_zak) : '');
  const [gudangAsal, setGudangAsal] = useState(editing?.gudang_asal ?? '');
  const [status, setStatus] = useState<'hadir' | 'tidak'>(editing?.status ?? 'hadir');
  const [jumlahPallet, setJumlahPallet] = useState(editing?.jumlah_pallet != null ? String(editing.jumlah_pallet) : '');
  const [asalPallet, setAsalPallet] = useState(editing?.asal_pallet ?? (editing && editing.jenis === 'reguler' ? 'gudang_kita' : ''));
  const [catatan, setCatatan] = useState(editing?.catatan ?? '');

  const isHadir = status === 'hadir';
  const needsPallet = isHadir && asalPallet !== '' && asalPallet !== 'tidak_ada';

  const save = async () => {
    if (!namaSopir.trim()) { w.triggerToast('Nama sopir wajib diisi.', 'error'); return; }
    if (!namaAngkutan.trim() && isBantuan) { w.triggerToast('Nama kendaraan / asal bantuan wajib diisi.', 'error'); return; }
    if (isHadir && asalPallet === '') { w.triggerToast('Pilih asal pallet (dari gudang kita / gudang lain / tidak bawa).', 'error'); return; }
    if (needsPallet && (!jumlahPallet || Number(jumlahPallet) <= 0)) { w.triggerToast('Jumlah pallet harus lebih dari 0.', 'error'); return; }
    if (isHadir && asalPallet === 'tidak_ada' && jumlahPallet && Number(jumlahPallet) > 0) {
      w.triggerToast('Kalau tidak bawa pallet, jumlah pallet harus 0 / kosong.', 'error');
      return;
    }

    const row = await w.upsertAbsenRow(editing?.id || null, {
      tanggal,
      angkutan_id: editing?.angkutan_id ?? null,
      jenis: isBantuan ? 'bantuan' : 'reguler',
      nama_sopir: namaSopir.trim(),
      nama_angkutan: isBantuan ? namaAngkutan.trim() : (editing?.nama_angkutan ?? ''),
      no_polisi: isBantuan ? (noPolisi.trim() || null) : (editing?.no_polisi ?? null),
      kapasitas_zak: kapasitas ? (Number(kapasitas) || null) : (isBantuan ? null : (editing?.kapasitas_zak ?? null)),
      gudang_asal: isBantuan ? (gudangAsal.trim() || null) : (editing?.gudang_asal ?? null),
      status,
      jumlah_pallet: isHadir ? (needsPallet ? (Number(jumlahPallet) || 0) : 0) : null,
      asal_pallet: isHadir ? (asalPallet || null) : null,
      catatan: catatan.trim() || null,
    });
    if (row) {
      if (!isEdit) w.triggerToast('Supir bantuan ditambahkan.');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              {isEdit
                ? <><Pencil style={{ width: 15, height: 15, color: 'var(--accent)' }} /> Edit Absen</>
                : <><Truck style={{ width: 15, height: 15, color: 'var(--accent)' }} /> Tambah Supir Bantuan</>}
            </div>
            <div className="text-xs text-muted" style={{ marginTop: 4 }}>{tanggal}</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup"><X style={{ width: 15, height: 15 }} /></button>
        </div>

        {!isBantuan && (
          <div className="alert alert-warn" style={{ marginBottom: '16px' }}>
            Nama / kendaraan supir tetap mengikuti data master armada dan tidak bisa diubah di sini.
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Nama Sopir</label>
            <input value={namaSopir} onChange={e => setNamaSopir(e.target.value)} placeholder="Pak Budi" disabled={!isBantuan && isEdit} autoFocus={isBantuan && !isEdit} />
          </div>
          <div className="form-group">
            <label>Nama Kendaraan / PO</label>
            <input value={namaAngkutan} onChange={e => setNamaAngkutan(e.target.value)} placeholder={isBantuan ? 'Truk Bantuan X' : '—'} disabled={!isBantuan && isEdit} />
          </div>
          {isBantuan && (
            <>
              <div className="form-group">
                <label>No Polisi</label>
                <input value={noPolisi} onChange={e => setNoPolisi(e.target.value)} placeholder="B 4321 XY" />
              </div>
              <div className="form-group">
                <label>Kapasitas (Zak)</label>
                <input type="number" min={0} value={kapasitas} onChange={e => setKapasitas(e.target.value)} placeholder="200" />
              </div>
              <div className="form-group full">
                <label>Bantuan Dari Gudang</label>
                <input value={gudangAsal} onChange={e => setGudangAsal(e.target.value)} placeholder="Cth: Gudang Cikarang" />
              </div>
            </>
          )}
          <div className="form-group full">
            <label>Status Kehadiran</label>
            <div className="seg" style={{ marginTop: '4px' }}>
              <button type="button" className={status === 'hadir' ? 'on-hadir' : ''} onClick={() => setStatus('hadir')}><Check /> Hadir</button>
              <button type="button" className={status === 'tidak' ? 'on-tidak' : ''} onClick={() => setStatus('tidak')}><X /> Tidak Hadir</button>
            </div>
          </div>
        </div>

        {isHadir && (
          <div className="form-grid" style={{ marginTop: '14px' }}>
            <div className="form-group">
              <label>Jumlah Pallet</label>
              <input
                type="number" min={0} value={jumlahPallet}
                onChange={e => setJumlahPallet(e.target.value)}
                placeholder={asalPallet === 'tidak_ada' ? '0' : '4'}
              />
            </div>
            <div className="form-group">
              <label>Asal Pallet</label>
              <select value={asalPallet} onChange={e => setAsalPallet(e.target.value)}>
                <option value="">— Pilih —</option>
                <option value="gudang_kita">Dari gudang kita (bawa 4)</option>
                <option value="gudang_lain">Bawa sendiri dari gudang lain</option>
                <option value="tidak_ada">Tidak bawa pallet</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Catatan Baris (Opsional)</label>
              <input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Cth: pallet patah, bantu muat 2 kali, dsb." />
            </div>
          </div>
        )}

        <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={() => void save()}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah & Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}
