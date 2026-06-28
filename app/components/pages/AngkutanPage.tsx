'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtDate } from '@/app/lib/helpers';
import { statusAngkutanBadge, statusAngkutanLabel, statusDOBadge, statusDOLabel } from '@/app/lib/constants';

interface Props { w: UseWarehouseReturn; }

export default function AngkutanPage({ w }: Props) {
  if (w.selectedAngkutan) {
    const aDO = w.deliveryOrders.filter(d => d.angkutan_id === w.selectedAngkutan!.id);
    const aDoAktif = aDO.find(d => d.status === 'proses');
    const totalZakDiantar = aDO.filter(d => d.status === 'selesai').reduce((s, d) => s + d.total_zak, 0);
    return (
      <div>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }} onClick={() => w.setSelectedAngkutan(null)}>← Kembali</button>
        <div className="card" style={{ marginBottom: '18px' }}>
          <div className="detail-header">
            <div className="detail-icon">🚚</div>
            <div>
              <div className="detail-title">{w.selectedAngkutan.nama_sopir}</div>
              <div className="detail-sub">{w.selectedAngkutan.nama_angkutan} · {w.selectedAngkutan.no_polisi || '—'}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className={`badge ${statusAngkutanBadge[w.selectedAngkutan.status]}`} style={{ fontSize: '13px', padding: '4px 12px' }}>{statusAngkutanLabel[w.selectedAngkutan.status]}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px 14px' }}>
              <div className="text-muted text-xs">Kapasitas</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent2)', marginTop: '4px' }}>{fmt(w.selectedAngkutan.kapasitas_zak)}</div>
              <div className="text-xs text-muted">zak maksimal</div>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px 14px' }}>
              <div className="text-muted text-xs">Total DO</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>{aDO.length}</div>
              <div className="text-xs text-muted">riwayat pengiriman</div>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px 14px' }}>
              <div className="text-muted text-xs">Zak Diantar</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>{fmt(totalZakDiantar)}</div>
              <div className="text-xs text-muted">zak (DO selesai)</div>
            </div>
          </div>
          {aDoAktif && (
            <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(232,160,69,0.08)', borderRadius: '8px', border: '1px solid rgba(232,160,69,0.2)' }}>
              <div className="text-xs text-muted" style={{ marginBottom: '6px' }}>SEDANG MEMBAWA</div>
              <div className="flex-row">
                <div className="font-bold text-accent">{aDoAktif.no_do}</div>
                <span className="text-muted">→</span>
                <div>{aDoAktif.toko?.nama}</div>
                <span className="badge b-yellow" style={{ marginLeft: 'auto' }}>{fmt(aDoAktif.total_zak)} Zak</span>
              </div>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title">Riwayat DO ({aDO.length})</div>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>No DO</th><th>Toko</th><th>Tanggal</th><th>Zak</th><th>Status</th></tr></thead>
              <tbody>
                {aDO.map(d => (
                  <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => { w.setSelectedDO(d); w.setActivePage('do'); }}>
                    <td className="font-bold text-accent">{d.no_do}</td>
                    <td>{d.toko?.nama || '—'}</td>
                    <td>{fmtDate(d.tanggal)}</td>
                    <td>{fmt(d.total_zak)}</td>
                    <td><span className={`badge ${statusDOBadge[d.status]}`}>{statusDOLabel[d.status]}</span></td>
                  </tr>
                ))}
                {aDO.length === 0 && <tr className="empty-row"><td colSpan={5}>Belum ada DO.</td></tr>}
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
        <div className="section-title">Armada Angkutan ({w.angkutans.length})</div>
        {w.user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => w.setModalAngkutan(true)}>+ Tambah Angkutan</button>
        )}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nama Sopir</th><th>Nama Angkutan</th><th>Kapasitas</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {w.angkutans.map(a => {
              return (
                <tr key={a.id} style={{ opacity: a.status === 'tidak_aktif' ? 0.6 : 1 }}>
                  <td>
                    <div className="font-bold">{a.nama_sopir}</div>
                    <div className="text-xs text-muted" style={{ marginTop: '2px' }}>{a.no_polisi || '—'}</div>
                  </td>
                  <td>{a.nama_angkutan}</td>
                  <td>{fmt(a.kapasitas_zak)} Zak</td>
                  <td><span className={`badge ${statusAngkutanBadge[a.status]}`}>{statusAngkutanLabel[a.status]}</span></td>
                  <td>
                    <div className="flex-row">
                      {w.user?.role === 'admin' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={async () => {
                            const newStatus = a.status === 'tersedia' ? 'tidak_aktif' : 'tersedia';
                            await w.supabase.from('angkutan').update({ status: newStatus }).eq('id', a.id);
                            w.triggerToast(`${a.nama_sopir} ditandai ${statusAngkutanLabel[newStatus]}`);
                            w.fetchAll();
                          }}
                          title="Tandai Hadir / Absen"
                          disabled={a.status === 'dalam_perjalanan'}
                        >
                          {a.status === 'tersedia' ? '💤 Tandai Absen' : '✅ Tandai Ready'}
                        </button>
                      )}
                      {w.user?.role === 'admin' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => w.openEditAngkutan(a)}>✏️</button>
                      )}
                      <button className="btn btn-blue btn-sm" onClick={() => w.setSelectedAngkutan(a)}>Detail</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {w.angkutans.length === 0 && <tr className="empty-row"><td colSpan={6}>Belum ada angkutan.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
