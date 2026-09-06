'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import type { DeliveryOrder, Pengiriman } from '@/app/lib/types';
import { fmt, fmtDate, fmtTime } from '@/app/lib/helpers';
import { statusPengirimanLabel } from '@/app/lib/constants';

interface Props { w: UseWarehouseReturn; }

type PengirimanWithDO = Pengiriman & { do: DeliveryOrder };

export default function PengirimanPage({ w }: Props) {
  const pengirimanRows = w.deliveryOrders
    .flatMap((d): PengirimanWithDO[] => (d.pengiriman || []).map(pg => ({ ...pg, do: d })))
    .sort((a, b) => new Date(b.waktu_berangkat).getTime() - new Date(a.waktu_berangkat).getTime());

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Pengiriman Bertahap</div>
        <button className="btn btn-blue" onClick={() => w.setModalPengiriman(true)}>+ Tambah Tahap</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>No DO</th><th>Tahap</th><th>Toko Tujuan</th><th>Supir Tahap</th><th>Zak</th><th>Pallet</th><th>Berangkat</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {pengirimanRows.map(pg => (
              <tr key={pg.id}>
                <td className="font-bold text-accent" style={{ fontFamily: 'monospace' }}>{pg.do.no_do}</td>
                <td><span className="badge b-blue">Tahap {pg.tahap}</span></td>
                <td>{pg.do.toko?.nama || '—'}</td>
                <td>{pg.angkutan?.nama_sopir || pg.do.angkutan?.nama_sopir || '—'}{pg.angkutan?.no_polisi ? ` · ${pg.angkutan.no_polisi}` : pg.do.angkutan?.no_polisi ? ` · ${pg.do.angkutan.no_polisi}` : ''}</td>
                <td className="font-bold">{fmt(pg.jumlah_zak)}</td>
                <td>{pg.jumlah_pallet}</td>
                <td>{fmtDate(pg.waktu_berangkat)} {fmtTime(pg.waktu_berangkat)}</td>
                <td><span className={`badge ${pg.status === 'tiba' ? 'b-green' : pg.status === 'jalan' ? 'b-yellow' : 'b-gray'}`}>{statusPengirimanLabel[pg.status]}</span></td>
                <td>
                  {pg.status === 'persiapan' && <button className="btn btn-sm" style={{ background: 'var(--warn)', color: '#000', padding: '3px 9px', fontSize: '11px' }} onClick={async () => { await w.supabase.from('pengiriman').update({ status: 'jalan' }).eq('id', pg.id); await w.supabase.from('audit_log').insert({ user_id: w.user?.id, tabel: 'pengiriman', aksi: 'UPDATE', ringkasan: `Tahap ${pg.tahap} ${pg.do.no_do} berangkat (${fmt(pg.jumlah_zak)} zak)` }); w.triggerToast('Berangkat'); w.fetchAll(); }}>🚚</button>}
                  {pg.status === 'jalan'     && <button className="btn btn-success btn-sm" style={{ padding: '3px 9px', fontSize: '11px' }} onClick={async () => { await w.supabase.from('pengiriman').update({ status: 'tiba', waktu_tiba: new Date().toISOString() }).eq('id', pg.id); await w.supabase.from('audit_log').insert({ user_id: w.user?.id, tabel: 'pengiriman', aksi: 'UPDATE', ringkasan: `Tahap ${pg.tahap} ${pg.do.no_do} tiba (${fmt(pg.jumlah_zak)} zak)` }); w.triggerToast('Tiba!'); w.fetchAll(); }}>✅</button>}
                  {(w.user?.role === 'admin' || w.user?.role === 'superadmin') && (
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: '4px' }} onClick={() => w.openEditPengiriman(pg)}>✏️</button>
                  )}
                  {(w.user?.role === 'admin' || w.user?.role === 'superadmin') && (
                    <button className="btn btn-danger btn-sm" style={{ marginLeft: '4px' }} onClick={() => w.deletePengiriman(pg.id)}>🗑️</button>
                  )}
                </td>
              </tr>
            ))}
            {w.deliveryOrders.every(d => !d.pengiriman || d.pengiriman.length === 0) && <tr className="empty-row"><td colSpan={9}>Belum ada pengiriman.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
