'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function ModalPengiriman({ w }: Props) {
  if (!w.modalPengiriman) return null;
  const doRef = w.deliveryOrders.find(d => d.id === w.pgDoId);
  const sudahDikirim = (doRef?.pengiriman || []).reduce((s, p) => s + p.jumlah_zak, 0);
  const sisa = doRef ? doRef.total_zak - sudahDikirim : 0;
  return (
    <div className="modal-overlay" onClick={() => w.setModalPengiriman(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🗺️ Catat Tahap Pengiriman Baru</div>
          <button className="modal-close" onClick={() => w.setModalPengiriman(false)}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Pilih Surat Jalan (DO)</label>
            <select value={w.pgDoId} onChange={e => w.setPgDoId(e.target.value)}>
              <option value="">— Pilih DO Aktif —</option>
              {w.deliveryOrders.filter(d => d.status === 'draft' || d.status === 'proses').map(d => (
                <option key={d.id} value={d.id}>{d.no_do} → {d.toko?.nama} (Sisa {fmt(d.total_zak - (d.pengiriman || []).reduce((s, p) => s + p.jumlah_zak, 0))} zak)</option>
              ))}
            </select>
          </div>
          {doRef && (
            <div className="form-group full" style={{ background: 'rgba(232,160,69,0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(232,160,69,0.2)' }}>
              <div className="text-sm font-bold text-accent mb-12">Total Muatan DO: {fmt(doRef.total_zak)} Zak</div>
              <div className="flex-between text-sm"><span>Sudah dikirim (tahap sblmnya):</span><span className="font-bold">{fmt(sudahDikirim)} Zak</span></div>
              <div className="flex-between text-sm"><span>Sisa yang harus dikirim:</span><span className="font-bold text-danger">{fmt(sisa)} Zak</span></div>
            </div>
          )}
          <div className="form-group">
            <label>Jumlah Dibawa (Zak)</label>
            <input 
              type="number" 
              value={w.pgZak} 
              onChange={e => {
                const val = e.target.value;
                w.setPgZak(val);
                if (doRef && doRef.do_items && doRef.do_items.length > 0) {
                  const berat = doRef.do_items[0].produk?.berat_per_zak || 50;
                  const zakPerPallet = 2000 / berat;
                  const autoPallet = Math.floor(Number(val) / zakPerPallet);
                  w.setPgPallet(autoPallet.toString());
                }
              }} 
            />
          </div>
          <div className="form-group"><label>Bawa Pallet (Opsional)</label><input type="number" value={w.pgPallet} onChange={e => w.setPgPallet(e.target.value)} placeholder="0" /></div>
          <div className="form-group full">
            <label>Status Saat Ini</label>
            <select value={w.pgStatus} onChange={e => w.setPgStatus(e.target.value as any)}>
              <option value="persiapan">Sedang Persiapan / Muat</option>
              <option value="jalan">Truk Berangkat</option>
              <option value="tiba">Sudah Tiba di Toko</option>
            </select>
          </div>
          <div className="form-group full"><label>Keterangan / Kendala</label><input value={w.pgCatatan} onChange={e => w.setPgCatatan(e.target.value)} /></div>
        </div>
        <button className="btn btn-blue w-full" style={{ marginTop: '20px', justifyContent: 'center' }} onClick={w.savePengiriman}>Simpan & Update DO</button>
      </div>
    </div>
  );
}
