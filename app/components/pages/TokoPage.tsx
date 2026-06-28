'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtDate, fmtTime } from '@/app/lib/helpers';
import { statusDOBadge, statusDOLabel } from '@/app/lib/constants';

interface Props { w: UseWarehouseReturn; }

export default function TokoPage({ w }: Props) {
  if (w.selectedToko) {
    const saldo = w.palletSaldoByToko(w.selectedToko.id);
    const tokoDO = w.deliveryOrders.filter(d => d.toko_id === w.selectedToko!.id);
    const tokoPL = w.palletLogs.filter(l => l.toko_id === w.selectedToko!.id);
    const totalZakToko = tokoDO.filter(d => d.status === 'selesai').reduce((s, d) => s + d.total_zak, 0);
    return (
      <div>
        <button className="btn btn-ghost btn-sm mb-16" style={{ marginBottom: '16px' }} onClick={() => w.setSelectedToko(null)}>← Kembali ke Daftar Toko</button>
        <div className="card" style={{ marginBottom: '18px' }}>
          <div className="detail-header">
            <div className="detail-icon">🏪</div>
            <div>
              <div className="detail-title">{w.selectedToko.nama}</div>
              <div className="detail-sub">{w.selectedToko.alamat || 'Alamat belum diisi'} · {w.selectedToko.no_hp || '—'}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px 14px' }}>
              <div className="text-muted text-xs">Saldo Pallet</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: saldo > w.selectedToko.batas_pallet * 0.8 ? 'var(--danger)' : 'var(--accent3)', marginTop: '4px' }}>{saldo}</div>
              <div className="pbar-wrap" style={{ marginTop: '6px' }}>
                <div className="pbar" style={{ width: `${w.selectedToko.batas_pallet > 0 ? Math.min((saldo / w.selectedToko.batas_pallet) * 100, 100) : 0}%`, background: 'var(--accent3)' }} />
              </div>
              <div className="text-xs text-muted" style={{ marginTop: '4px' }}>batas {w.selectedToko.batas_pallet}</div>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px 14px' }}>
              <div className="text-muted text-xs">Total DO</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent2)', marginTop: '4px' }}>{tokoDO.length}</div>
              <div className="text-xs text-muted">surat jalan</div>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px 14px' }}>
              <div className="text-muted text-xs">Total Semen Dikirim</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>{fmt(totalZakToko)}</div>
              <div className="text-xs text-muted">zak (DO selesai)</div>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px 14px' }}>
              <div className="text-muted text-xs">Pemilik</div>
              <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>{w.selectedToko.pemilik || '—'}</div>
              <div className="text-xs text-muted">{w.selectedToko.no_hp || '—'}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: '18px' }}>
          <div className="card-title">Riwayat DO ({tokoDO.length})</div>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>No DO</th><th>Tanggal</th><th>Angkutan</th><th>Total Zak</th><th>Pallet</th><th>Status</th></tr></thead>
              <tbody>
                {tokoDO.map(d => (
                  <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => { w.setSelectedDO(d); w.setActivePage('do'); }}>
                    <td className="font-bold text-accent">{d.no_do}</td>
                    <td>{fmtDate(d.tanggal)}</td>
                    <td>{d.angkutan?.nama_sopir || '—'}</td>
                    <td>{fmt(d.total_zak)}</td>
                    <td>{d.total_pallet}</td>
                    <td><span className={`badge ${statusDOBadge[d.status]}`}>{statusDOLabel[d.status]}</span></td>
                  </tr>
                ))}
                {tokoDO.length === 0 && <tr className="empty-row"><td colSpan={6}>Belum ada DO.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="flex-between mb-12" style={{ marginBottom: '12px' }}>
            <div className="card-title" style={{ margin: 0 }}>Log Pallet Toko ({tokoPL.length})</div>
            <button className="btn btn-purple btn-sm" onClick={() => { w.setPlTokoId(w.selectedToko!.id); w.setModalPallet(true); }}>+ Catat Pallet</button>
          </div>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>Tanggal</th><th>Jenis</th><th>Jumlah</th><th>DO</th><th>Catatan</th></tr></thead>
              <tbody>
                {tokoPL.map(l => (
                  <tr key={l.id}>
                    <td>{fmtDate(l.tanggal)} {fmtTime(l.tanggal)}</td>
                    <td><span className={`badge ${l.jenis === 'keluar' ? 'b-keluar' : 'b-masuk'}`}>{l.jenis === 'keluar' ? '→ Ke Toko' : '← Kembali'}</span></td>
                    <td className="font-bold">{l.jumlah}</td>
                    <td>{w.deliveryOrders.find(d => d.id === l.do_id)?.no_do || '—'}</td>
                    <td className="text-muted">{l.catatan || '—'}</td>
                  </tr>
                ))}
                {tokoPL.length === 0 && <tr className="empty-row"><td colSpan={5}>Belum ada log pallet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="section-header">
        <div className="section-title">Mitra Toko ({w.tokos.length})</div>
        {w.user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => w.setModalToko(true)}>+ Tambah Toko</button>
        )}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nama Toko</th><th>Pemilik</th><th>No HP</th><th>Saldo Pallet</th><th>Batas Pallet</th><th>Detail</th></tr></thead>
          <tbody>
            {w.tokos.map(t => {
              const saldo = w.palletSaldoByToko(t.id);
              const pct = t.batas_pallet > 0 ? Math.min((saldo / t.batas_pallet) * 100, 100) : 0;
              return (
                <tr key={t.id}>
                  <td className="font-bold">{t.nama}</td>
                  <td>{t.pemilik || '—'}</td>
                  <td>{t.no_hp || '—'}</td>
                  <td>
                    <div className="flex-row gap-12">
                      <span className={`font-bold ${saldo > t.batas_pallet * 0.8 ? 'text-danger' : 'text-accent'}`}>{saldo}</span>
                      <div style={{ width: '80px' }}>
                        <div className="pbar-wrap">
                          <div className="pbar" style={{ width: `${pct}%`, background: pct > 80 ? 'var(--danger)' : 'var(--accent3)' }} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{t.batas_pallet}</td>
                  <td><button className="btn btn-blue btn-sm" onClick={() => w.setSelectedToko(t)}>Lihat Detail</button></td>
                </tr>
              );
            })}
            {w.tokos.length === 0 && <tr className="empty-row"><td colSpan={6}>Belum ada toko.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
