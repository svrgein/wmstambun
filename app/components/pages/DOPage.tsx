'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtDate, fmtTime } from '@/app/lib/helpers';
import { statusDOBadge, statusDOLabel, statusPengirimanLabel } from '@/app/lib/constants';

interface Props { w: UseWarehouseReturn; }

export default function DOPage({ w }: Props) {
  if (w.selectedDO) {
    const items = w.selectedDO.do_items || [];
    const shipments = (w.selectedDO.pengiriman || []).sort((a, b) => a.tahap - b.tahap);
    const totalShipped = shipments.reduce((s, p) => s + p.jumlah_zak, 0);
    const remaining = w.selectedDO.total_zak - totalShipped;
    return (
      <div>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }} onClick={() => w.setSelectedDO(null)}>← Kembali ke Daftar DO</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '18px' }}>
          <div>
            <div className="card" style={{ marginBottom: '18px' }}>
              <div className="detail-header">
                <div className="detail-icon">📋</div>
                <div>
                  <div className="detail-title" style={{ fontFamily: 'monospace' }}>{w.selectedDO.no_do}</div>
                  <div className="detail-sub">{fmtDate(w.selectedDO.tanggal)}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className={`badge ${statusDOBadge[w.selectedDO.status]}`} style={{ fontSize: '13px', padding: '4px 12px' }}>{statusDOLabel[w.selectedDO.status]}</span>
                </div>
              </div>
              <div className="info-row"><div className="info-key">Toko</div><div className="info-val font-bold">{w.selectedDO.toko?.nama || '—'}</div></div>
              <div className="info-row"><div className="info-key">Sopir / Armada</div><div className="info-val">{w.selectedDO.angkutan?.nama_sopir || '—'} · {w.selectedDO.angkutan?.no_polisi || '—'}</div></div>
              <div className="info-row"><div className="info-key">Total Zak</div><div className="info-val font-bold text-accent">{fmt(w.selectedDO.total_zak)} Zak</div></div>
              <div className="info-row"><div className="info-key">Sudah Dikirim</div><div className="info-val font-bold text-success">{fmt(totalShipped)} Zak</div></div>
              <div className="info-row"><div className="info-key">Sisa Kirim</div><div className="info-val font-bold text-danger">{fmt(remaining)} Zak</div></div>
              <div className="info-row"><div className="info-key">Total Pallet</div><div className="info-val">{w.selectedDO.total_pallet}</div></div>
              {w.selectedDO.catatan && <div className="info-row"><div className="info-key">Catatan</div><div className="info-val text-muted">{w.selectedDO.catatan}</div></div>}
            </div>
            <div className="card" style={{ marginBottom: '18px' }}>
              <div className="card-title">Isi Semen DO</div>
              <div className="table-wrap" style={{ border: 'none' }}>
                <table>
                  <thead><tr><th>Produk</th><th>Merk</th><th>Jumlah</th><th>Ton</th></tr></thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id}>
                        <td>{item.produk?.nama || '—'}</td>
                        <td>{item.produk?.merk || '—'}</td>
                        <td className="font-bold">{fmt(item.jumlah_zak)} Zak</td>
                        <td className="text-blue">{((item.jumlah_zak * (item.produk?.berat_per_zak || 50)) / 1000).toFixed(2)} T</td>
                      </tr>
                    ))}
                    {items.length === 0 && <tr className="empty-row"><td colSpan={4}>Tidak ada item.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            {w.selectedDO.status !== 'selesai' && w.selectedDO.status !== 'batal' && (
              <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-blue" onClick={() => { w.setPgDoId(w.selectedDO!.id); w.setModalPengiriman(true); }}>+ Tambah Tahap Pengiriman</button>
                <button className="btn btn-purple" onClick={() => { w.setPlTokoId(w.selectedDO!.toko_id); w.setPlDoId(w.selectedDO!.id); w.setModalPallet(true); }}>+ Catat Pallet Keluar</button>
                {w.selectedDO.status === 'proses' && (
                  <button className="btn btn-success" onClick={async () => {
                    await w.supabase.from('delivery_order').update({ status: 'selesai' }).eq('id', w.selectedDO!.id);
                    if (w.selectedDO!.angkutan_id) await w.supabase.from('angkutan').update({ status: 'tersedia' }).eq('id', w.selectedDO!.angkutan_id);
                    await w.supabase.from('audit_log').insert({
                      user_id: w.user?.id, tabel: 'delivery_order', aksi: 'UPDATE',
                      ringkasan: `DO ${w.selectedDO!.no_do} ditandai SELESAI`,
                    });
                    w.triggerToast(`${w.selectedDO!.no_do} ditandai selesai`);
                    w.fetchAll();
                    w.setSelectedDO(prev => prev ? { ...prev, status: 'selesai' } : prev);
                  }}>✅ Tandai Selesai</button>
                )}
                {w.user?.role === 'admin' && (
                  <button className="btn btn-ghost" onClick={async () => {
                    if (!confirm('Batalkan DO ini?')) return;
                    await w.supabase.from('delivery_order').update({ status: 'batal' }).eq('id', w.selectedDO!.id);
                    await w.supabase.from('audit_log').insert({
                      user_id: w.user?.id, tabel: 'delivery_order', aksi: 'UPDATE',
                      ringkasan: `DO ${w.selectedDO!.no_do} DIBATALKAN`,
                    });
                    w.triggerToast(`${w.selectedDO!.no_do} dibatalkan`, 'error');
                    w.fetchAll();
                    w.setSelectedDO(null);
                  }}>✕ Batalkan DO</button>
                )}
              </div>
            )}
          </div>
          {/* Timeline */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-title">Timeline Pengiriman</div>
            {shipments.length === 0
              ? <div className="text-muted text-sm">Belum ada tahap pengiriman.</div>
              : (
                <div className="timeline">
                  {shipments.map((pg, idx) => (
                    <div key={pg.id} className="timeline-item">
                      <div className="timeline-left">
                        <div className={`tl-dot ${pg.status === 'tiba' ? 'done' : pg.status === 'jalan' ? 'active' : ''}`} />
                        {idx < shipments.length - 1 && <div className="tl-line" />}
                      </div>
                      <div className="timeline-body">
                        <div className="flex-between">
                          <div className="font-bold text-sm">Tahap {pg.tahap}</div>
                          <span className={`badge ${pg.status === 'tiba' ? 'b-green' : pg.status === 'jalan' ? 'b-yellow' : 'b-gray'}`}>{statusPengirimanLabel[pg.status]}</span>
                        </div>
                        <div className="text-xs text-muted" style={{ marginTop: '3px' }}>{fmtDate(pg.waktu_berangkat)} {fmtTime(pg.waktu_berangkat)}</div>
                        <div className="text-sm" style={{ marginTop: '5px' }}>
                          <span className="text-accent font-bold">{fmt(pg.jumlah_zak)} Zak</span>
                          {pg.jumlah_pallet > 0 && <span className="text-muted"> · {pg.jumlah_pallet} Pallet</span>}
                        </div>
                        {pg.catatan && <div className="text-xs text-muted" style={{ marginTop: '3px' }}>{pg.catatan}</div>}
                        {pg.status !== 'tiba' && (
                          <div className="flex-row" style={{ marginTop: '8px', gap: '6px' }}>
                            {pg.status === 'persiapan' && (
                              <button className="btn btn-sm" style={{ background: 'var(--warn)', color: '#000', padding: '3px 9px', fontSize: '11px' }} onClick={async () => {
                                await w.supabase.from('pengiriman').update({ status: 'jalan' }).eq('id', pg.id);
                                await w.supabase.from('audit_log').insert({
                                  user_id: w.user?.id, tabel: 'pengiriman', aksi: 'UPDATE',
                                  ringkasan: `Pengiriman tahap ${pg.tahap} ${w.selectedDO?.no_do || ''} BERANGKAT (${fmt(pg.jumlah_zak)} zak)`,
                                });
                                w.triggerToast(`Tahap ${pg.tahap} berangkat`); w.fetchAll();
                              }}>🚚 Berangkat</button>
                            )}
                            {pg.status === 'jalan' && (
                              <button className="btn btn-success btn-sm" style={{ padding: '3px 9px', fontSize: '11px' }} onClick={async () => {
                                await w.supabase.from('pengiriman').update({ status: 'tiba', waktu_tiba: new Date().toISOString() }).eq('id', pg.id);
                                await w.supabase.from('audit_log').insert({
                                  user_id: w.user?.id, tabel: 'pengiriman', aksi: 'UPDATE',
                                  ringkasan: `Pengiriman tahap ${pg.tahap} ${w.selectedDO?.no_do || ''} TIBA di toko (${fmt(pg.jumlah_zak)} zak)`,
                                });
                                w.triggerToast(`Tahap ${pg.tahap} tiba di toko`); w.fetchAll();
                              }}>✅ Tiba</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="section-header">
        <div className="section-title">Delivery Order ({w.deliveryOrders.length})</div>
        <button className="btn btn-primary" onClick={() => w.setModalDO(true)}>+ Buat DO</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>No DO</th><th>Tanggal</th><th>Toko</th><th>Sopir</th><th>Total Zak</th><th>Pallet</th><th>Status</th><th>Detail</th></tr></thead>
          <tbody>
            {w.deliveryOrders.map(d => (
              <tr key={d.id}>
                <td className="font-bold text-accent" style={{ fontFamily: 'monospace' }}>{d.no_do}</td>
                <td>{fmtDate(d.tanggal)}</td>
                <td>{d.toko?.nama || '—'}</td>
                <td>{d.angkutan?.nama_sopir || '—'}</td>
                <td className="font-bold">{fmt(d.total_zak)}</td>
                <td>{d.total_pallet}</td>
                <td><span className={`badge ${statusDOBadge[d.status]}`}>{statusDOLabel[d.status]}</span></td>
                <td><button className="btn btn-blue btn-sm" onClick={() => w.setSelectedDO(d)}>Detail</button></td>
              </tr>
            ))}
            {w.deliveryOrders.length === 0 && <tr className="empty-row"><td colSpan={8}>Belum ada DO.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
