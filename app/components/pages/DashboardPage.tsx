'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmt, fmtTon } from '@/app/lib/helpers';
import { statusDOBadge, statusDOLabel } from '@/app/lib/constants';

interface Props {
  w: UseWarehouseReturn;
}

export default function DashboardPage({ w }: Props) {
  const bal = w.getPalletBalance();
  const masukToday = w.todayTrx.filter(t => t.jenis === 'masuk');
  const keluarToday = w.todayTrx.filter(t => t.jenis === 'keluar');
  const masukTodayZak = masukToday.reduce((sum, t) => sum + t.jumlah_zak, 0);
  const keluarTodayZak = keluarToday.reduce((sum, t) => sum + t.jumlah_zak, 0);
  const masukTodayTon = w.todayTonIn;
  const keluarTodayTon = w.todayTonOut;
  
  const categoryOrder = ['GMS', 'TMS', 'IMK'] as const;
  const armadaStatus = categoryOrder.map(cat => {
    const items = w.angkutanGroups?.[cat] || [];
    const ready = items.filter(a => a.status === 'tersedia').length;
    return { cat, total: items.length, ready };
  });

  const totalPallet = bal.total || 1;

  // Active DOs for Kiriman Bertahap (Processing or Draft today)
  const todayStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD in local time
  const activeDOs = w.deliveryOrders.filter(d => d.status === 'proses' || (d.status === 'draft' && d.tanggal.startsWith(todayStr))).slice(0, 5);

  return (
    <div>
      <div className="dash-header">
        <h1 className="dash-title">Dashboard</h1>
        <p className="dash-subtitle">Ringkasan operasional gudang hari ini.</p>
      </div>

      <div className="dash-grid-4">
        <div className="dash-card-stat primary">
          <div className="stat-title">
            <span>Total Stok</span>
            <div className="dash-icon-circle">📦</div>
          </div>
          <div className="stat-val">{fmt(w.totalZak)}</div>
          <div className="stat-sub">
            <span style={{background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px'}}>{w.products.length} Varian</span>
            {fmtTon(w.totalTon)} Tonase
          </div>
        </div>

        <div className="dash-card-stat">
          <div className="stat-title">
            <span>DO Aktif</span>
            <div className="dash-icon-circle">📋</div>
          </div>
          <div className="stat-val">{activeDOs.length}</div>
          <div className="stat-sub">
            <span style={{background: 'rgba(17,108,76,0.1)', color: '#116c4c', padding: '2px 6px', borderRadius: '4px'}}>Surat Jalan / Proses</span>
          </div>
        </div>

        <div className="dash-card-stat">
          <div className="stat-title">
            <span>Barang Masuk</span>
            <div className="dash-icon-circle">⬇️</div>
          </div>
          <div className="stat-val">{masukToday.length}</div>
          <div className="stat-sub">
            <span style={{background: 'rgba(17,108,76,0.1)', color: '#116c4c', padding: '2px 6px', borderRadius: '4px'}}>{fmt(masukTodayZak)} Zak</span>
            <span style={{color: 'var(--muted)', marginLeft: '4px'}}>{fmtTon(masukTodayTon)} Ton</span>
          </div>
        </div>

        <div className="dash-card-stat">
          <div className="stat-title">
            <span>Barang Keluar</span>
            <div className="dash-icon-circle">⬆️</div>
          </div>
          <div className="stat-val">{keluarToday.length}</div>
          <div className="stat-sub">
            <span style={{background: 'rgba(17,108,76,0.1)', color: '#116c4c', padding: '2px 6px', borderRadius: '4px'}}>{fmt(keluarTodayZak)} Zak</span>
            <span style={{color: 'var(--muted)', marginLeft: '4px'}}>{fmtTon(keluarTodayTon)} Ton</span>
          </div>
        </div>
      </div>

      <div className="dash-grid-bento">
        {/* Detail Stok Semen */}
        <div className="dash-panel">
          <div className="dash-panel-title">Rincian Stok Semen</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {w.products.map(p => {
              const maxCap = 600; 
              const pct = Math.min((p.stok_zak / maxCap) * 100, 100);
              const tonase = (p.stok_zak * p.berat_per_zak) / 1000;
              
              return (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: p.stok_rendah ? 'var(--danger)' : 'var(--text)' }}>
                        {p.merk} {p.nama}
                      </span>
                      {p.stok_rendah && <span className="dash-badge" style={{ background: 'var(--danger)', color: '#fff' }}>Stok Kritis</span>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{fmt(p.stok_zak)} Zak</span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '6px' }}>({fmtTon(tonase)} Ton)</span>
                    </div>
                  </div>
                  <div className="pbar-wrap" style={{ height: '8px', background: 'var(--border)' }}>
                    <div className="pbar" style={{ width: `${pct}%`, background: p.stok_rendah ? 'var(--danger)' : '#116c4c' }} />
                  </div>
                </div>
              );
            })}
            {w.products.length === 0 && <div className="text-muted" style={{textAlign: 'center', padding: '20px 0'}}>Belum ada produk semen.</div>}
          </div>
        </div>

        {/* Detail Pallet */}
        <div className="dash-panel">
          <div className="dash-panel-title">
            Detail Posisi Pallet
            {(w.user?.role === 'admin' || w.user?.role === 'superadmin') && (
              <button className="btn btn-ghost btn-sm" style={{borderRadius: '20px'}} onClick={() => w.setModalPalletStok(true)}>Kelola</button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Total Pallet Terdaftar</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{fmt(bal.total)}</div>
            </div>
            
            <div className="balance-row" style={{ height: '14px', borderRadius: '7px' }}>
              {bal.kosong > 0 && <div className="balance-seg" style={{ width: `${(bal.kosong / totalPallet) * 100}%`, background: '#116c4c' }} title={`Gudang Kosong: ${bal.kosong}`} />}
              {bal.isi > 0 && <div className="balance-seg" style={{ width: `${(bal.isi / totalPallet) * 100}%`, background: '#3b82f6' }} title={`Gudang Isi: ${bal.isi}`} />}
              {bal.angkutan > 0 && <div className="balance-seg" style={{ width: `${(bal.angkutan / totalPallet) * 100}%`, background: '#f59e0b' }} title={`Di Angkutan: ${bal.angkutan}`} />}
              {bal.toko > 0 && <div className="balance-seg" style={{ width: `${(bal.toko / totalPallet) * 100}%`, background: '#8b5cf6' }} title={`Di Toko: ${bal.toko}`} />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#116c4c'}}></span> Gudang (Kosong)</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{fmt(bal.kosong)}</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#3b82f6'}}></span> Gudang (Isi Semen)</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{fmt(bal.isi)}</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#f59e0b'}}></span> Di Angkutan</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{fmt(bal.angkutan)}</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6'}}></span> Deposit Toko</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{fmt(bal.toko)}</div>
              </div>
            </div>
            {bal.selisih !== 0 && (
              <div style={{ background: 'rgba(224,82,82,0.1)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                ⚠️ Terdapat selisih pallet: {bal.selisih}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dash-grid-bento">
        {/* DO & Kiriman Bertahap */}
        <div className="dash-panel">
          <div className="dash-panel-title">
            Status DO & Pengiriman Bertahap
            <button className="btn btn-primary btn-sm" style={{ borderRadius: '20px' }} onClick={() => w.setActivePage('pengiriman')}>Detail Pengiriman</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeDOs.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)' }}>Tidak ada DO aktif / proses saat ini.</div>
            ) : (
              activeDOs.map(d => {
                const terkirim = d.pengiriman?.reduce((s, p) => s + p.jumlah_zak, 0) || 0;
                const progress = d.total_zak > 0 ? (terkirim / d.total_zak) * 100 : 0;
                
                return (
                  <div key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {d.no_do}
                          <span className={`dash-badge ${statusDOBadge[d.status] === 'b-green' ? 'green' : 'yellow'}`}>{statusDOLabel[d.status]}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{d.toko?.nama || 'Tanpa Toko'} — {d.angkutan?.nama_sopir || 'Tanpa Angkutan'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{fmt(terkirim)} / {fmt(d.total_zak)} Zak</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Terkirim</div>
                      </div>
                    </div>
                    <div className="pbar-wrap" style={{ height: '6px', background: 'var(--surface)' }}>
                      <div className="pbar" style={{ width: `${progress}%`, background: progress >= 100 ? '#116c4c' : '#f59e0b' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Armada Status */}
        <div className="dash-panel">
          <div className="dash-panel-title">
            Kesiapan Armada
            <button className="btn btn-ghost btn-sm" style={{ borderRadius: '20px' }} onClick={() => w.setActivePage('angkutan')}>Lihat Sopir</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {armadaStatus.map((s, i) => (
              <div key={s.cat} className="dash-list-item">
                <div className="dash-avatar" style={{ background: i===0 ? '#f0fdf4' : (i===1 ? '#fefce8' : '#eff6ff'), color: i===0 ? '#116c4c' : (i===1 ? '#b45309' : '#1d4ed8') }}>
                  {s.cat[0]}
                </div>
                <div className="dash-list-info">
                  <div className="dash-list-title">Grup {s.cat}</div>
                  <div className="dash-list-sub">{s.total} Truk Terdaftar</div>
                </div>
                <span className={`dash-badge ${s.ready === s.total && s.total > 0 ? 'green' : 'yellow'}`}>
                  {s.ready}/{s.total} Ready
                </span>
              </div>
            ))}
            {armadaStatus.every(s => s.total === 0) && <div className="text-muted text-sm" style={{padding: '12px 0'}}>Belum ada armada.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}

