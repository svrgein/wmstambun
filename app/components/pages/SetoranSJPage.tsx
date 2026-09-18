'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCheck, ChevronDown, ClipboardCheck, Clock3, Pencil, Plus,
  Search, Stamp, Trash2, X,
} from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import type { SetoranSJ } from '@/app/lib/types';
import { today, fmtDate } from '@/app/lib/helpers';
import { supabase } from '@/lib/lib/supabase';

interface Props { w: UseWarehouseReturn; }

const REASONS = [
  'Belum stempel',
  'SJ belum kembali dari toko',
  'Sopir belum sempat setor',
  'Menunggu diambil pusat',
  'SJ ketinggalan / hilang',
  'Lainnya',
];

const isAdmin = (role?: string) => role === 'admin' || role === 'superadmin';

const SETUP_SQL = `create table if not exists public.setoran_sj (
  id uuid primary key default gen_random_uuid(),
  no_sj text not null,
  angkutan text not null default '',
  toko text not null default '',
  tanggal date null,
  status text not null default 'belum' check (status in ('belum','disetor')),
  alasan text null,
  catatan text null,
  disetor_tanggal date null,
  disetor_oleh uuid null references public.profiles(id) on delete set null,
  dibuat_oleh uuid null references public.profiles(id) on delete set null,
  updated_oleh uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists setoran_sj_status_idx on public.setoran_sj (status);
create index if not exists setoran_sj_tanggal_idx on public.setoran_sj (tanggal desc);
create index if not exists setoran_sj_created_idx on public.setoran_sj (created_at desc);
alter table public.setoran_sj enable row level security;
create policy "setoran_sj select" on public.setoran_sj
  for select using (auth.role() = 'authenticated');
create policy "setoran_sj insert admin" on public.setoran_sj
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );
create policy "setoran_sj update admin" on public.setoran_sj
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );
create policy "setoran_sj delete admin" on public.setoran_sj
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );`;

type Tab = 'belum' | 'disetor' | 'semua';
type FormStatus = 'belum' | 'disetor';

interface Draft {
  id: string | null;
  no_sj: string;
  angkutan: string;
  toko: string;
  tanggal: string;
  status: FormStatus;
  alasan: string;
  catatan: string;
  disetorTanggal: string;
}

const emptyDraft = (): Draft => ({
  id: null,
  no_sj: '',
  angkutan: '',
  toko: '',
  tanggal: '',
  status: 'belum',
  alasan: REASONS[0],
  catatan: '',
  disetorTanggal: today(),
});

export default function SetoranSJPage({ w }: Props) {
  const [records, setRecords] = useState<SetoranSJ[] | null>(null);
  const [missingTable, setMissingTable] = useState(false);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('belum');
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const admin = isAdmin(w.user?.role);

  const loadRecords = async () => {
    const { data, error } = await supabase
      .from('setoran_sj')
      .select('*, dibuatBy:dibuat_oleh(nama), disetorBy:disetor_oleh(nama), updatedBy:updated_oleh(nama)')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) {
      const msg = error.message || '';
      const isMissing = /could not find the table/i.test(msg) || /does not exist/i.test(msg) || /42P01/i.test(msg);
      if (isMissing) {
        setMissingTable(true);
        setRecords([]);
        return;
      }
      console.error('Gagal memuat buku setoran SJ:', error.message);
      w.triggerToast('Gagal memuat data. Pastikan tabel setoran_sj sudah dibuat & RLS aktif.', 'error');
      setRecords([]);
      return;
    }
    setMissingTable(false);
    setRecords(data as SetoranSJ[]);
  };

  useEffect(() => {
    if (w.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.user]);

  const isTelat = (r: SetoranSJ) =>
    r.status === 'belum' && !!r.tanggal && r.tanggal < today();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = (records || []).filter(r => {
      if (tab === 'belum' && r.status !== 'belum') return false;
      if (tab === 'disetor' && r.status !== 'disetor') return false;
      if (!needle) return true;
      return (
        r.no_sj.toLowerCase().includes(needle)
        || r.angkutan.toLowerCase().includes(needle)
        || r.toko.toLowerCase().includes(needle)
      );
    });
    return base;
  }, [records, q, tab]);

  const countOf = (t: Tab) => {
    const needle = q.trim().toLowerCase();
    return (records || []).filter(r => {
      if (needle && !(
        r.no_sj.toLowerCase().includes(needle)
        || r.angkutan.toLowerCase().includes(needle)
        || r.toko.toLowerCase().includes(needle)
      )) return false;
      if (t === 'belum') return r.status === 'belum';
      if (t === 'disetor') return r.status === 'disetor';
      return true;
    }).length;
  };
  const countTelat = (records || []).filter(r => isTelat(r)).length;

  const isLoading = records === null;

  const openCreate = () => {
    setDraft(emptyDraft());
    setSaving(false);
  };

  const openEdit = (r: SetoranSJ) => {
    setDraft({
      id: r.id,
      no_sj: r.no_sj,
      angkutan: r.angkutan,
      toko: r.toko,
      tanggal: r.tanggal || '',
      status: r.status,
      alasan: r.alasan || REASONS[0],
      catatan: r.catatan || '',
      disetorTanggal: r.disetor_tanggal || today(),
    });
    setSaving(false);
  };

  const closeModal = () => setDraft(null);

  const saveDraft = async () => {
    if (!draft || !w.user || saving) return;
    const no_sj = draft.no_sj.trim();
    const angkutan = draft.angkutan.trim();
    const toko = draft.toko.trim();
    if (!no_sj || !angkutan || !toko) {
      w.triggerToast('Isi No. SJ, angkutan/sopir, dan toko.', 'error');
      return;
    }
    if (draft.status === 'disetor' && !draft.disetorTanggal) {
      w.triggerToast('Pilih tanggal disetor.', 'error');
      return;
    }

    const isDisetor = draft.status === 'disetor';
    const base = {
      no_sj,
      angkutan,
      toko,
      tanggal: draft.tanggal || null,
      status: draft.status,
      alasan: isDisetor ? null : draft.alasan,
      catatan: draft.catatan.trim() || null,
      disetor_tanggal: isDisetor ? draft.disetorTanggal : null,
      disetor_oleh: isDisetor ? w.user.id : null,
      updated_oleh: w.user.id,
    };

    setSaving(true);
    let error = null;
    if (draft.id) {
      const res = await supabase.from('setoran_sj').update(base).eq('id', draft.id);
      error = res.error;
    } else {
      const res = await supabase.from('setoran_sj').insert({ ...base, dibuat_oleh: w.user.id });
      error = res.error;
    }
    setSaving(false);

    if (error) {
      console.error('Gagal simpan SJ:', error.message);
      w.triggerToast('Gagal menyimpan. Periksa kembali (RLS / tabel setoran_sj).', 'error');
      return;
    }
    w.triggerToast(isDisetor ? `${no_sj} sudah ditandai disetor.` : `${no_sj} dicatat sebagai belum disetor.`);
    closeModal();
    void loadRecords();
  };

  const markDisetor = (r: SetoranSJ) => {
    setDraft({
      id: r.id,
      no_sj: r.no_sj,
      angkutan: r.angkutan,
      toko: r.toko,
      tanggal: r.tanggal || '',
      status: 'disetor',
      alasan: r.alasan || REASONS[0],
      catatan: '',
      disetorTanggal: today(),
    });
    setSaving(false);
  };

  const deleteRecord = async (r: SetoranSJ) => {
    if (!window.confirm(`Hapus catatan ${r.no_sj}?`)) return;
    const { error } = await supabase.from('setoran_sj').delete().eq('id', r.id);
    if (error) {
      console.error('Gagal hapus:', error.message);
      w.triggerToast('Gagal menghapus.', 'error');
      return;
    }
    w.triggerToast('Catatan dihapus.');
    if (openId === r.id) setOpenId(null);
    void loadRecords();
  };

  const filterBtn = (t: Tab, label: string, icon: React.ReactNode, count: number) => (
    <button
      key={t}
      className="btn btn-sm"
      onClick={() => setTab(t)}
      style={{
        borderRadius: '99px',
        background: tab === t ? 'var(--card3)' : 'var(--card2)',
        boxShadow: tab === t ? 'var(--sh-raise)' : 'none',
        color: tab === t ? 'var(--text)' : 'var(--muted)',
        borderColor: 'var(--border)',
      }}
    >
      {icon}
      {label}
      <span className="badge b-gray" style={{ fontSize: 10, padding: '1px 7px' }}>{count}</span>
    </button>
  );

  if (missingTable) {
    return (
      <div>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="section-title">Buku Setoran Surat Jalan</div>
            <div className="section-subtitle">Catat manual No. SJ, angkutan/sopir & toko yang wajib disetor ke pusat.</div>
          </div>
        </div>

        <div className="card">
          <div className="flex-row" style={{ gap: 12, marginBottom: 14 }}>
            <div className="tb-icon-chip"><ClipboardCheck /></div>
            <div>
              <div className="font-bold" style={{ fontSize: 16 }}>Tabel database belum dibuat</div>
              <div className="text-sm text-muted" style={{ marginTop: 2 }}>
                Fitur ini butuh tabel <b style={{ fontFamily: 'monospace' }}>setoran_sj</b> di database Supabase-mu.
              </div>
            </div>
          </div>

          <ol style={{ paddingLeft: 20, display: 'grid', gap: 8, fontSize: 13.5, color: 'var(--text-sub)' }}>
            <li>Buka <b>Supabase Dashboard → SQL Editor</b>.</li>
            <li>
              Kalau sebelumnya pernah menjalankan versi tabel lama, jalankan dulu:
              <pre style={{ marginTop: 6, background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>{'drop table if exists public.setoran_sj;'}</pre>
            </li>
            <li>
              Salin & jalankan skrip pembuatan tabel berikut (atau buka file <b style={{ fontFamily: 'monospace' }}>supabase/setoran-sj.sql</b> di project):
              <details style={{ marginTop: 6 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>Lihat & salin SQL</summary>
                <pre
                  style={{
                    marginTop: 8, maxHeight: 260, overflow: 'auto', whiteSpace: 'pre-wrap',
                    background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 12,
                    padding: '12px 14px', fontFamily: 'monospace', fontSize: 11.5, color: 'var(--text-sub)',
                  }}
                >{SETUP_SQL}</pre>
              </details>
            </li>
            <li>Kembali ke halaman ini, lalu klik <b>“Muat Ulang”</b> di bawah.</li>
          </ol>

          <div className="flex-row" style={{ gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => { setRecords(null); void loadRecords(); }}>
              Muat Ulang
            </button>
            <span className="text-xs text-muted">Butuh bantuan? Hubungi yang pegang akses Supabase.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <div>
          <div className="section-title">Buku Setoran Surat Jalan</div>
          <div className="section-subtitle">
            Catat manual No. SJ, angkutan/sopir & toko yang wajib disetor ke pusat.
          </div>
        </div>
        {admin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus style={{ width: 16, height: 16 }} /> Catat SJ Baru
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
        <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: '1 1 260px' }}>
            <Search />
            <input
              placeholder="Cari No. SJ / angkutan / toko…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <div className="flex-row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            {filterBtn('belum', 'Belum', <Clock3 style={{ width: 13, height: 13 }} />, countOf('belum'))}
            {filterBtn('disetor', 'Disetor', <CheckCheck style={{ width: 13, height: 13 }} />, countOf('disetor'))}
            {filterBtn('semua', 'Semua', <ClipboardCheck style={{ width: 13, height: 13 }} />, countOf('semua'))}
          </div>
          <span className="chip" title="SJ masih belum disetor padahal sudah melewati tanggalnya">
            <Clock3 style={{ color: countTelat > 0 ? 'var(--danger)' : 'var(--muted)' }} />
            <b>{countTelat}</b> telat
          </span>
        </div>
      </div>

      {!admin && records !== null && (
        <div className="alert alert-warn" style={{ marginBottom: '14px' }}>
          <Clock3 style={{ width: 15, height: 15, flexShrink: 0 }} />
          <span>Mode hanya-baca. Hubungi admin/superadmin untuk mengubah buku setoran SJ.</span>
        </div>
      )}

      {/* Daftar */}
      {isLoading ? (
        <div className="empty-state">Memuat buku setoran…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardCheck style={{ width: 30, height: 30, margin: '0 auto 8px', color: 'var(--muted)', display: 'block' }} />
          {q
            ? 'Tidak ditemukan catatan yang cocok dengan pencarian.'
            : tab === 'belum'
              ? 'Tidak ada SJ yang belum disetor. Mantap.'
              : tab === 'disetor'
                ? 'Belum ada SJ yang ditandai sudah disetor.'
                : 'Buku masih kosong. Klik “Catat SJ Baru” untuk memulai.'}
        </div>
      ) : (
        <div className="table-wrap resp-table">
          <table>
            <thead>
              <tr>
                <th style={{ width: 34 }} />
                <th>No. SJ</th>
                <th>Angkutan / Sopir</th>
                <th>Toko</th>
                <th>Tanggal</th>
                <th>Status Setoran</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const open = openId === r.id;
                const telat = isTelat(r);
                return (
                  <React.Fragment key={r.id}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => setOpenId(open ? null : r.id)}>
                      <td className="sj-toggle" style={{ textAlign: 'center' }}>
                        <ChevronDown
                          style={{
                            width: 14, height: 14, color: 'var(--muted)',
                            transform: open ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                          }}
                        />
                      </td>
                      <td data-label="No. SJ">
                        <div className="font-bold" style={{ fontSize: 13.5 }}>{r.no_sj}</div>
                      </td>
                      <td data-label="Angkutan / Sopir">
                        <div className="font-bold">{r.angkutan || '—'}</div>
                      </td>
                      <td data-label="Toko">{r.toko || '—'}</td>
                      <td data-label="Tanggal" style={{ whiteSpace: 'nowrap' }}>
                        {r.tanggal ? fmtDate(r.tanggal) : <span className="text-muted">—</span>}
                      </td>
                      <td data-label="Status Setoran">
                        {r.status === 'disetor' ? (
                          <>
                            <span className="badge b-green"><CheckCheck /> Disetor</span>
                            {r.disetor_tanggal && (
                              <div className="text-xs text-muted" style={{ marginTop: 3 }}>
                                {fmtDate(r.disetor_tanggal)}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <span className={`badge ${telat ? 'b-red' : 'b-yellow'}`}>
                              <Clock3 /> {telat ? 'Telat' : 'Belum'}
                            </span>
                            {r.alasan && (
                              <div className="text-xs text-muted" style={{ marginTop: 3 }}>
                                {r.alasan}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="sj-actions" data-label="Aksi" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {admin && (
                          <>
                            {r.status !== 'disetor' && (
                              <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); markDisetor(r); }} title="Tandai sudah disetor">
                                <Stamp style={{ width: 13, height: 13 }} /> Disetor
                              </button>
                            )}
                            <button className="btn btn-ghost btn-sm icon-btn" onClick={e => { e.stopPropagation(); openEdit(r); }} title="Ubah catatan" aria-label="Ubah catatan">
                              <Pencil />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                    {open && (
                      <tr className="sj-detail-row">
                        <td colSpan={7} style={{ background: 'var(--card2)' }}>
                          <div className="info-row">
                            <div className="info-key">Alasan / Status</div>
                            <div className="info-val">
                              {r.status === 'disetor'
                                ? `Sudah disetor ${r.disetor_tanggal ? `pada ${fmtDate(r.disetor_tanggal)}` : ''}${r.disetorBy?.nama ? ` oleh ${r.disetorBy.nama}` : ''}.`
                                : telat
                                  ? 'Telat — belum disetor padahal sudah lewat tanggalnya.'
                                  : 'Belum disetor.'}
                              {r.status === 'belum' && r.alasan && <span style={{ color: 'var(--warn)', fontWeight: 800 }}> ({r.alasan})</span>}
                            </div>
                          </div>
                          {r.catatan && (
                            <div className="info-row">
                              <div className="info-key">Catatan</div>
                              <div className="info-val">{r.catatan}</div>
                            </div>
                          )}
                          <div className="info-row">
                            <div className="info-key">Dicatat</div>
                            <div className="info-val">
                              {r.dibuatBy?.nama || '—'} · {fmtDate(r.created_at)}
                              {r.updatedBy?.nama && ` · diperbarui ${r.updatedBy.nama}`}
                            </div>
                          </div>
                          {admin && (
                            <div className="flex-row" style={{ justifyContent: 'flex-end', padding: '6px 0 2px' }}>
                              <button className="btn btn-ghost btn-sm btn-danger-text" onClick={() => void deleteRecord(r)}>
                                <Trash2 style={{ width: 13, height: 13 }} /> Hapus Catatan
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal catat / ubah */}
      {draft && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-title">{draft.id ? 'Ubah Catatan SJ' : 'Catat SJ Baru'}</div>
              <button className="modal-close" onClick={closeModal} aria-label="Tutup"><X style={{ width: 15, height: 15 }} /></button>
            </div>

            <div className="form-grid" style={{ marginBottom: 4 }}>
              <div className="form-group">
                <label>No. Surat Jalan *</label>
                <input
                  value={draft.no_sj}
                  onChange={e => setDraft({ ...draft, no_sj: e.target.value })}
                  placeholder="cth: SJ-2026-091"
                />
              </div>
              <div className="form-group">
                <label>Tanggal (opsional)</label>
                <input type="date" value={draft.tanggal} onChange={e => setDraft({ ...draft, tanggal: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Angkutan / Sopir *</label>
                <input
                  value={draft.angkutan}
                  onChange={e => setDraft({ ...draft, angkutan: e.target.value })}
                  placeholder="cth: GMS 05 - Budi"
                />
              </div>
              <div className="form-group">
                <label>Toko *</label>
                <input
                  value={draft.toko}
                  onChange={e => setDraft({ ...draft, toko: e.target.value })}
                  placeholder="cth: Toko Sumber Rejeki"
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label>Status setoran</label>
              <div className="seg" style={{ width: '100%' }}>
                <button
                  type="button"
                  className={draft.status === 'belum' ? 'on-tidak' : undefined}
                  style={{ flex: 1, justifyContent: 'center', background: draft.status === 'belum' ? 'var(--warn)' : 'transparent', color: draft.status === 'belum' ? '#211500' : 'var(--muted)' }}
                  onClick={() => setDraft({ ...draft, status: 'belum' })}
                >
                  <Clock3 /> Belum Disetor
                </button>
                <button
                  type="button"
                  className={draft.status === 'disetor' ? 'on-hadir' : undefined}
                  style={{ flex: 1, justifyContent: 'center', background: draft.status === 'disetor' ? 'var(--success)' : 'transparent', color: draft.status === 'disetor' ? '#fff' : 'var(--muted)' }}
                  onClick={() => setDraft({ ...draft, status: 'disetor' })}
                >
                  <Stamp /> Sudah Disetor
                </button>
              </div>
            </div>

            {draft.status === 'belum' ? (
              <>
                <div style={{ marginTop: 16 }}>
                  <label>Alasan belum disetor</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {REASONS.map(reason => (
                      <button
                        key={reason}
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setDraft({ ...draft, alasan: reason })}
                        style={{
                          borderRadius: 99,
                          background: draft.alasan === reason ? 'var(--accent)' : 'var(--card2)',
                          color: draft.alasan === reason ? '#211500' : 'var(--text-sub)',
                          boxShadow: draft.alasan === reason ? 'var(--sh-raise)' : 'none',
                        }}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ marginTop: 16 }}>
                <label>Tanggal disetor *</label>
                <input type="date" value={draft.disetorTanggal} onChange={e => setDraft({ ...draft, disetorTanggal: e.target.value })} />
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <label>Catatan (opsional)</label>
              <textarea
                rows={3}
                placeholder={draft.status === 'disetor'
                  ? 'cth: disetor telat oleh sopir…'
                  : 'cth: sudah diingatkan, janji besok pagi…'}
                value={draft.catatan}
                onChange={e => setDraft({ ...draft, catatan: e.target.value })}
              />
            </div>

            <div className="flex-row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={closeModal}>Batal</button>
              <button className={`btn ${draft.status === 'disetor' ? 'btn-success' : 'btn-primary'}`} onClick={() => void saveDraft()} disabled={saving}>
                {saving ? 'Menyimpan…' : draft.id ? 'Simpan Perubahan' : 'Simpan Catatan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
