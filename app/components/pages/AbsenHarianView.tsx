'use client';

import React, { useState } from 'react';
import {
  CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Download, Pencil,
  Plus, Trash2, Truck, X,
} from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import type { AbsenHarian, Angkutan } from '@/app/lib/types';
import { fmtAgo, dayKey, today, addDays } from '@/app/lib/helpers';
import { downloadXlsx, type XlsxCol, type XlsxValue, type XlsxSheet } from '@/app/lib/exportXlsx';
import ModalAbsen from '@/app/components/modals/ModalAbsen';

interface Props { w: UseWarehouseReturn; }

const absenIcon = (name: string) => (name || '?').charAt(0).toUpperCase();

const asalShort = (s?: string | null) =>
  s === 'gudang_kita' ? 'dari gudang kita'
    : s === 'gudang_lain' ? 'bawa dari gudang lain'
    : s === 'tidak_ada' ? 'tidak bawa'
    : '';

function DriverRow({
  w, admin, sopir, tanggal, record, isBantuan, last,
  onEdit, onDelete,
}: {
  w: UseWarehouseReturn;
  admin: boolean;
  sopir: Angkutan;
  tanggal: string;
  record?: AbsenHarian;
  isBantuan: boolean;
  last: boolean;
  onEdit: (r: AbsenHarian) => void;
  onDelete: (r: AbsenHarian) => void;
}) {
  const namaSopir = record?.nama_sopir || sopir.nama_sopir;
  const namaAngkutan = record?.nama_angkutan || sopir.nama_angkutan;
  const noPolisi = record?.no_polisi || sopir.no_polisi;
  const sed = (d: 'hadir' | 'tidak') => () => void w.toggleAbsenStatus(sopir, tanggal, d, record);

  const avatarCls = !record ? 'no' : record.status === 'hadir' ? 'hadir' : 'tidak';

  return (
    <div className="driver-row" style={last ? { borderBottom: 'none' } : undefined}>
      {/* Sopir */}
      <div className="driver-main">
        <div className={`driver-avatar ${avatarCls}`}>{absenIcon(namaSopir)}</div>
        <div style={{ minWidth: 0 }}>
          <div className="driver-name">
            {namaSopir}
            {sopir.status === 'dalam_perjalanan' && (
              <span className="badge b-yellow" style={{ fontSize: '10px', padding: '3px 8px', gap: 4 }}>
                <Truck style={{ width: 10, height: 10 }} /> lagi bawa DO
              </span>
            )}
          </div>
          <div className="driver-sub">
            <span>{namaAngkutan}</span>
            {noPolisi && (<><span className="sep">·</span><span style={{ fontFamily: 'monospace' }}>{noPolisi}</span></>)}
            {isBantuan && record?.gudang_asal && (<><span className="sep">·</span><span>dari {record.gudang_asal}</span></>)}
          </div>
          {record?.catatan && (
            <div className="driver-note">📝 {record.catatan}</div>
          )}
        </div>
      </div>

      {/* Status & pallet */}
      <div className="driver-status">
        {record ? (
          <>
            <span className={`badge ${record.status === 'hadir' ? 'b-green' : 'b-red'}`} style={{ fontSize: '12px', padding: '5px 10px' }}>
              {record.status === 'hadir' ? (<><Check style={{ width: 12, height: 12 }} /> Hadir</>) : (<><X style={{ width: 12, height: 12 }} /> Tidak Hadir</>)}
            </span>
            {record.status === 'hadir' && (
              <span className="badge b-yellow" style={{ fontSize: '12px', padding: '5px 10px' }}>
                {record.jumlah_pallet ?? 0} pallet · {asalShort(record.asal_pallet)}
              </span>
            )}
          </>
        ) : (
          <span className="badge b-gray" style={{ fontSize: '12px', padding: '5px 10px' }}>belum diabsen</span>
        )}
      </div>

      {/* Aksi */}
      <div className="driver-actions">
        {admin && (
          <>
            <div className="seg">
              <button
                type="button"
                className={record?.status === 'hadir' ? 'on-hadir' : ''}
                onClick={sed('hadir')}
                aria-pressed={record?.status === 'hadir'}
              >
                <Check /> Hadir
              </button>
              <button
                type="button"
                className={record?.status === 'tidak' ? 'on-tidak' : ''}
                onClick={sed('tidak')}
                aria-pressed={record?.status === 'tidak'}
              >
                <X /> Tidak
              </button>
            </div>
            {record && (
              <>
                <button className="btn btn-ghost btn-sm icon-btn" title="Edit baris" onClick={() => onEdit(record)}>
                  <Pencil />
                </button>
                <button
                  className="btn btn-ghost btn-sm icon-btn btn-danger-text"
                  title="Hapus baris"
                  onClick={() => { if (window.confirm(`Hapus absen ${record.nama_sopir} pada ${record.tanggal}?`)) onDelete(record); }}
                >
                  <Trash2 />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AbsenHarianView({ w }: Props) {
  const [date, setDateState] = useState(today());
  const [noteDraft, setNoteDraft] = useState('');
  const [addBantuanOpen, setAddBantuanOpen] = useState(false);
  const [editing, setEditing] = useState<AbsenHarian | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);

  const admin = w.user?.role === 'admin' || w.user?.role === 'superadmin';
  const rows = w.absenRows.filter(r => r.tanggal === date);
  const regulerRecords = rows.filter(r => r.jenis === 'reguler');
  const bantuanRecords = rows.filter(r => r.jenis === 'bantuan');

  const active = (list: Angkutan[]) => list.filter(a => a.status !== 'tidak_aktif');
  const catGroups = [
    { key: 'GMS', items: active(w.angkutanGroups.GMS) },
    { key: 'TMS', items: active(w.angkutanGroups.TMS) },
    { key: 'IMK', items: active(w.angkutanGroups.IMK) },
    { key: 'Lainnya', items: active(w.angkutanGroups.Lainnya) },
  ].filter(g => g.items.length > 0);
  const masterCount = catGroups.reduce((s, g) => s + g.items.length, 0);

  const byAngkutan = (id: string) => regulerRecords.find(r => r.angkutan_id === id);

  const sumPallet = (list: AbsenHarian[], asal: string | null) =>
    list.filter(r => r.status === 'hadir' && (asal ? r.asal_pallet === asal : true))
      .reduce((s, r) => s + (r.jumlah_pallet || 0), 0);

  const hadirCount = rows.filter(r => r.status === 'hadir').length;
  const tidakCount = rows.filter(r => r.status === 'tidak').length;
  const belumCount = masterCount - regulerRecords.length;
  const palletKita = sumPallet(rows, 'gudang_kita');
  const palletLain = sumPallet(rows, 'gudang_lain');

  const changeDate = (d: string) => {
    setDateState(d);
    setNoteDraft(w.absenDailyNotes[d]?.isi ?? '');
    setEditing(null);
    setAddBantuanOpen(false);
  };

  const dailyNote = w.absenDailyNotes[date];
  const dateActivity = w.auditLogs.filter(l =>
    (l.tabel === 'absen_harian' || l.tabel === 'absen_catatan_harian') && dayKey(l.created_at) === date,
  );

  const stat = (label: string, val: React.ReactNode, color: string, sub?: string) => (
    <div className="stat-card white">
      <div className="stat-label">{label}</div>
      <div className="stat-val" style={{ color, fontSize: '26px' }}>{val}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );

  // ── Export Excel (.xlsx — rapi per sel) ──
  const exportExcel = async () => {
    const cols: XlsxCol[] = [
      { header: 'ARMADA', width: 11, align: 'center' },
      { header: 'NAMA SOPIR', width: 24 },
      { header: 'KENDARAAN', width: 18 },
      { header: 'NO POLISI', width: 15, align: 'center' },
      { header: 'GUDANG ASAL', width: 15, align: 'center' },
      { header: 'STATUS', width: 14, align: 'center' },
      { header: 'JUMLAH PALLET', width: 15, numFmt: '#,##0', align: 'center' },
      { header: 'ASAL PALLET', width: 22 },
      { header: 'CATATAN', width: 36, wrap: true },
    ];

    const rows: XlsxValue[][] = [];
    catGroups.forEach(cat => {
      cat.items.forEach(a => {
        const r = byAngkutan(a.id);
        rows.push([
          cat.key,
          r?.nama_sopir || a.nama_sopir,
          r?.nama_angkutan || a.nama_angkutan,
          r?.no_polisi || a.no_polisi || '',
          r?.gudang_asal || '',
          r ? (r.status === 'hadir' ? 'Hadir' : 'Tidak Hadir') : 'Belum diabsen',
          r?.status === 'hadir' ? (r.jumlah_pallet ?? 0) : '',
          r ? asalShort(r.asal_pallet) : '',
          r?.catatan || '',
        ]);
      });
    });
    bantuanRecords.forEach(r => {
      rows.push([
        'BANTUAN',
        r.nama_sopir,
        r.nama_angkutan,
        r.no_polisi || '',
        r.gudang_asal || '',
        r.status === 'hadir' ? 'Hadir' : 'Tidak Hadir',
        r.status === 'hadir' ? (r.jumlah_pallet ?? 0) : '',
        asalShort(r.asal_pallet),
        r.catatan || '',
      ]);
    });

    const sheets: XlsxSheet[] = [{ name: 'Absen Harian', cols, rows, banded: true }];

    const noteText = dailyNote?.isi || '';
    if (noteText.trim()) {
      // estimasi tinggi baris agar catatan terlihat utuh
      const estLines = Math.max(1, Math.ceil(noteText.length / 95));
      sheets.push({
        name: 'Catatan Harian',
        cols: [
          { header: 'Tanggal', width: 16, align: 'center' },
          { header: `Catatan Harian (${date})`, width: 110, wrap: true },
        ],
        rows: [[date, noteText]],
        freeze: false,
        autoFilter: false,
        banded: false,
        rowHeights: [Math.min(360, estLines * 15 + 6)],
      });
    }

    try {
      await downloadXlsx(`Absen_Harian_${date}.xlsx`, sheets);
      w.triggerToast('File Excel (.xlsx) berhasil diunduh.');
    } catch {
      w.triggerToast('Gagal membuat file Excel. Silakan coba lagi.');
    }
  };

  return (
    <div>
      {/* ── Tanggal & catatan harian ── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="flex-row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm icon-btn" onClick={() => changeDate(addDays(date, -1))} aria-label="Hari sebelumnya"><ChevronLeft /></button>
            <div className="flex-row" style={{ gap: '8px' }}>
              <CalendarDays style={{ width: 16, height: 16, color: 'var(--muted)' }} />
              <input
                type="date"
                value={date}
                onChange={e => e.target.value && changeDate(e.target.value)}
                style={{ width: 'auto' }}
              />
            </div>
            <button className="btn btn-ghost btn-sm icon-btn" onClick={() => changeDate(addDays(date, 1))} aria-label="Hari berikutnya"><ChevronRight /></button>
            <button className="btn btn-ghost btn-sm" onClick={() => changeDate(today())}>Hari ini</button>
          </div>
          <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
            <span className="text-sm text-muted">
              {date === today() ? 'Hari ini' : date} · {masterCount} supir tetap · {bantuanRecords.length} bantuan
            </span>
            <button className="btn btn-blue btn-sm" onClick={() => void exportExcel()} title="Unduh sebagai file Excel (.xlsx)">
              <Download style={{ width: 13, height: 13 }} /> Excel
            </button>
          </div>
        </div>

        {/* Catatan harian */}
        <div style={{ marginTop: '16px', borderTop: '1.5px solid var(--border)', paddingTop: '14px' }}>
          <label>Catatan Harian ({date})</label>
          <div className="flex-row" style={{ alignItems: 'flex-start', gap: '8px', marginTop: '6px' }}>
            <textarea
              rows={2}
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              placeholder="Tulis catatan hari ini — perubahan stok pallet, kendala, info armada, dll."
              style={{ minHeight: '52px', maxHeight: '120px', flex: 1 }}
              disabled={!admin}
            />
            {admin && (
              <button className="btn btn-primary" onClick={() => void w.saveAbsenDailyNote(date, noteDraft)} disabled={noteDraft === (dailyNote?.isi || '')}>
                Simpan Catatan
              </button>
            )}
          </div>
          {dailyNote?.updated_at && (
            <div className="text-xs text-muted" style={{ marginTop: 5 }}>
              Terakhir disimpan {fmtAgo(dailyNote.updated_at)}
            </div>
          )}
        </div>
      </div>

      {/* ── Ringkasan hari ── */}
      <div className="stat-grid">
        {stat('Hadir', hadirCount, 'var(--success)', 'total masuk hari ini')}
        {stat('Tidak Hadir', tidakCount, 'var(--danger)', 'absen hari ini')}
        {stat('Belum Diabsen', belumCount, 'var(--warn)', 'supir tetap belum isi')}
        {stat('Pallet (Gudang Kita)', palletKita, 'var(--accent)', 'dipakai dari stok kita')}
        {stat('Pallet (Gudang Lain)', palletLain, 'var(--accent3)', 'dibawa supir bantuan')}
      </div>

      {/* ── Supir tetap per armada ── */}
      {catGroups.length === 0 ? (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-title">Supir Tetap</div>
          <div className="text-muted text-sm" style={{ padding: '8px 0' }}>
            Belum ada data armada. Tambah dulu di tab Master Armada.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          {catGroups.map(cat => {
            const catRecs = regulerRecords.filter(r => cat.items.some(a => a.id === r.angkutan_id));
            const catBelum = cat.items.length - catRecs.length;
            const catHadir = catRecs.filter(r => r.status === 'hadir').length;
            const pct = cat.items.length > 0 ? (catHadir / cat.items.length) * 100 : 0;
            return (
              <div className="card" key={cat.key}>
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <div className="card-title" style={{ margin: 0 }}>
                    {cat.key} · {catHadir}/{cat.items.length} hadir
                  </div>
                  {catBelum > 0 && (
                    <span className="badge b-warn" style={{ fontSize: '11px' }}>{catBelum} belum diabsen</span>
                  )}
                </div>
                <div className="agrp-bar">
                  <div className={`agrp-pbar${pct >= 100 ? '' : ' warn'}`}><i style={{ width: `${pct}%` }} /></div>
                  <span className="agrp-pmeta">{Math.round(pct)}%</span>
                </div>
                <div className="driver-list" style={{ marginTop: '8px' }}>
                  {cat.items.map((a, i) => (
                    <DriverRow
                      key={a.id}
                      w={w} admin={admin} sopir={a} tanggal={date}
                      record={byAngkutan(a.id)} isBantuan={false}
                      last={i === cat.items.length - 1}
                      onEdit={r => setEditing(r)}
                      onDelete={r => void w.deleteAbsenRow(r)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Supir bantuan ── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="flex-between" style={{ marginBottom: '6px' }}>
          <div className="card-title" style={{ margin: 0 }}>
            Supir Bantuan / dari Gudang Lain ({bantuanRecords.length})
          </div>
          {admin && (
            <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setAddBantuanOpen(true); }}>
              <Plus style={{ width: 13, height: 13 }} /> Tambah Supir Bantuan
            </button>
          )}
        </div>
        {bantuanRecords.length === 0 ? (
          <div className="text-muted text-sm" style={{ padding: '10px 0' }}>
            Tidak ada supir bantuan hari ini. Gunakan tombol di atas kalau ada bantuan dari gudang lain.
          </div>
        ) : (
          <div className="driver-list">
            {bantuanRecords.map((r, i) => (
              <DriverRow
                key={r.id}
                w={w} admin={admin}
                sopir={{
                  id: r.id,
                  nama_sopir: r.nama_sopir,
                  nama_angkutan: r.nama_angkutan,
                  no_polisi: r.no_polisi || '',
                  kapasitas_zak: r.kapasitas_zak ?? 0,
                  status: 'tersedia',
                  catatan: r.catatan || '',
                  created_at: r.created_at,
                }}
                tanggal={date}
                record={r}
                isBantuan
                last={i === bantuanRecords.length - 1}
                onEdit={x => setEditing(x)}
                onDelete={x => void w.deleteAbsenRow(x)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Aktivitas hari ini (collapsible) ── */}
      {dateActivity.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <button
            onClick={() => setActivityOpen(o => !o)}
            aria-expanded={activityOpen}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 18px', border: 'none', background: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--card2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="card-title" style={{ marginBottom: 0, flex: 1 }}>
              Aktivitas Perubahan ({date})
            </div>
            <span className="badge b-gray">{dateActivity.length}</span>
            <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>
              <ChevronDown
                style={{
                  width: 16, height: 16,
                  transform: activityOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </span>
          </button>

          {activityOpen && (
            <div
              style={{
                borderTop: '1px solid var(--border)',
                padding: '4px 18px 12px',
                maxHeight: 320, overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {dateActivity.map(l => (
                <div key={l.id} className="info-row">
                  <div className="info-key" style={{ width: 'auto', paddingRight: 12 }}>
                    {fmtAgo(l.created_at)}
                  </div>
                  <div className="info-val">{l.ringkasan}</div>
                  <div className="text-xs text-muted" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {l.profiles?.nama || '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(addBantuanOpen || editing) && (
        <ModalAbsen
          w={w}
          tanggal={date}
          editing={editing}
          onClose={() => { setAddBantuanOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
