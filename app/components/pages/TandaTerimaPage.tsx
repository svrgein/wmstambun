'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown, ClipboardPaste, Download, History,
  MoreVertical, Pencil, Search, Stamp, Truck, X,
} from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import type { TandaTerima } from '@/app/lib/types';
import { fmt, fmtDate, today } from '@/app/lib/helpers';
import {
  ALASAN_TUNGU, SETORAN_DEFAULT_NOTE,
  statusKirimBadge, statusKirimLabel, statusKirimLabelEn,
  statusSetoranBadge, statusSetoranLabel,
} from '@/app/lib/constants';
import { downloadXlsx } from '@/app/lib/exportXlsx';

interface Props { w: UseWarehouseReturn; }

const isAdmin = (role?: string) => role === 'admin' || role === 'superadmin';

const FLEETS = ['GMS', 'TMS', 'IMK'] as const;
type Category = typeof FLEETS[number] | 'Lainnya';

// 'inti' juga IMK (user: "inti tuh imk") — cth INTITRANS masuk IMK.
const rowCategory = (angkutan: string): Category => {
  const n = (angkutan || '').toLowerCase();
  if (n.includes('gms')) return 'GMS';
  if (n.includes('tms')) return 'TMS';
  if (n.includes('imk') || n.includes('inti')) return 'IMK';
  return 'Lainnya';
};

const SETUP_SQL = `create table if not exists public.tanda_terima (
  id uuid primary key default gen_random_uuid(),
  print_date date not null,
  angkutan text not null default '',
  order_date date null,
  sdo text not null,
  jadwal_kirim date null,
  customer_code text null,
  customer text null,
  adres text null,
  destination text null,
  cement_type text null,
  pack text null,
  qty numeric null,
  status_kirim text not null default 'belum' check (status_kirim in ('belum','tunggu_info','terkirim','batal')),
  alasan_tunggu text null,
  delv_date date null,
  status_setoran text not null default 'belum' check (status_setoran in ('belum','disetor')),
  setoran_note text null,
  cek_angkutan text not null default 'belum' check (cek_angkutan in ('belum','sudah')),
  catatan text null,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sdo)
);
create index if not exists tanda_terima_print_idx on public.tanda_terima (print_date desc);
create index if not exists tanda_terima_angkutan_idx on public.tanda_terima (angkutan);
create index if not exists tanda_terima_kirim_idx on public.tanda_terima (status_kirim);
create index if not exists tanda_terima_setoran_idx on public.tanda_terima (status_setoran);
alter table public.tanda_terima enable row level security;
create policy "tanda_terima select" on public.tanda_terima for select using (auth.role() = 'authenticated');
create policy "tanda_terima insert admin" on public.tanda_terima
  for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin')));
create policy "tanda_terima update admin" on public.tanda_terima
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin')));
create policy "tanda_terima delete admin" on public.tanda_terima
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin')));`;

const MONTH_MAP: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7,
  agu: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12,
};

const parseFlexDate = (value: string): string | null => {
  const v = value.trim();
  if (!v) return null;
  let m = v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const yy = y.length === 2 ? `20${y}` : y;
    return `${yy}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  m = v.match(/^(\d{1,2})[\/\-. ]([A-Za-z]{3,})[\/\-. ](\d{2,4})$/);
  if (m) {
    const [, d, mon, y] = m;
    const mi = MONTH_MAP[mon.toLowerCase().slice(0, 3)];
    if (mi) {
      const yy = y.length === 2 ? `20${y}` : y;
      return `${yy}-${String(mi).padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return null;
};

export interface ParsedRow {
  order_date: string | null;
  sdo: string;
  jadwal_kirim: string | null;
  customer_code: string | null;
  customer: string | null;
  adres: string | null;
  destination: string | null;
  cement_type: string | null;
  pack: string | null;
  qty: number | null;
}

const parseTandaTerima = (paste: string): ParsedRow[] => {
  const rows: ParsedRow[] = [];
  paste.split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach(line => {
    if (/tanda terima/i.test(line)) return;
    if (/search by sdo/i.test(line)) return;
    if (/^no\b|print date|order date|customer code/i.test(line)) return;
    if (/^[A-Za-z]{3,}\s+\d{4}$/.test(line)) return;
    let cells = line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/);
    cells = cells.map(c => c.trim()).filter(c => c !== '' && c !== '.');
    if (cells.length < 3) return;
    if (/^\d{1,3}$/.test(cells[0])) cells = cells.slice(1);
    if (cells.length < 3) return;
    const [order_date, sdo, jadwal_kirim, customer_code, customer, adres,
      destination, cement_type, pack, qty] = cells;
    if (!sdo || !/^\d{4,}$/.test(sdo)) return;
    rows.push({
      order_date: parseFlexDate(order_date), sdo: sdo.trim(),
      jadwal_kirim: parseFlexDate(jadwal_kirim), customer_code: customer_code || null,
      customer: customer || null, adres: adres || null, destination: destination || null,
      cement_type: cement_type || null, pack: pack || null,
      qty: qty ? Number(qty.replace(/[^\d.]/g, '')) || null : null,
    });
  });
  return rows;
};

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const monthLabel = (dateStr: string) => {
  const m = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
  const d = new Date(dateStr + 'T12:00:00');
  return `${m[d.getMonth()]} ${d.getFullYear()}`;
};

// kunci sortir utk riwayat: tanggal paling relevan (delv > print > order)
const rowDate = (r: TandaTerima) => r.delv_date || r.print_date || r.order_date || r.created_at;

type QuickMode = 'kirim' | 'setoran';
type View = 'harian' | 'riwayat';

// Tabel compact ala spreadsheet — biar banyak DO/hari gak makan tempat.
const COMPACT_CSS = `
/* ─── base tabel ─── */
.tt-compact, .tt-compact table { font-size: 12.5px; }
.tt-compact table { border-collapse: collapse; width: 100%; }
.tt-compact th {
  padding: 7px 10px !important; font-size: 10px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
  background: var(--card2); color: var(--muted);
  border-bottom: 2px solid var(--border2); position: sticky; top: 0; z-index: 2;
}
.tt-compact td { padding: 7px 10px !important; line-height: 1.45; border-bottom: 1px solid var(--border); vertical-align: middle; }
.tt-compact tbody tr:nth-child(even) td { background: rgba(255,255,255,0.018); }
[data-theme="light"] .tt-compact tbody tr:nth-child(even) td { background: rgba(0,0,0,0.02); }
.tt-compact tbody tr:hover td { background: rgba(246,166,10,0.06) !important; }
.tt-compact .badge { font-size: 10.5px; padding: 2px 8px; }
.tt-compact .icon-btn { padding: 2px 3px; }
.tt-flash td { animation: tt-flash 2.5s ease-out; }
@keyframes tt-flash { 0%,30% { background: rgba(246,166,10,0.28) !important; } 100% { background: transparent; } }

/* ─── kolom responsive ─── */
@media (max-width: 768px) {
  .tt-col-dest, .tt-col-cement, .tt-col-delv { display: none !important; }
  .tt-compact th, .tt-compact td { padding: 6px 7px !important; }
}
@media (max-width: 480px) {
  .tt-col-date { display: none !important; }
  .tt-compact th, .tt-compact td { padding: 5px 5px !important; font-size: 11.5px; }
}

/* ─── alert bar ─── */
.tt-alert-bar {
  display: flex; gap: 6px; flex-wrap: wrap; align-items: center;
  margin-bottom: 10px;
}
.tt-alert-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 99px; cursor: pointer;
  border: 1.5px solid var(--border); background: var(--card);
  font-family: inherit; font-size: 12px; font-weight: 700;
  color: var(--text-sub); transition: background 0.12s;
  white-space: nowrap;
}
.tt-alert-chip:hover { background: var(--card3); }
.tt-alert-chip.danger { border-color: rgba(255,92,92,0.5); color: var(--danger); }
.tt-alert-chip.warn   { border-color: rgba(255,194,51,0.5); color: var(--warn); }
.tt-alert-chip.active-danger { background: rgba(255,92,92,0.12); border-color: var(--danger); }
.tt-alert-chip.active-warn   { background: rgba(255,194,51,0.12); border-color: var(--warn); }
.tt-alert-chip .num { font-size: 13px; font-weight: 900; }

/* ─── filter toolbar ─── */
.tt-toolbar {
  display: flex; gap: 7px; flex-wrap: wrap; align-items: center;
  background: var(--card2); border: 1px solid var(--border);
  border-radius: 10px; padding: 8px 12px; margin-bottom: 10px;
}
.tt-toolbar-label {
  font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--muted); white-space: nowrap;
}

/* ─── tabs ─── */
.tt-tabs { display: flex; gap: 2px; border-bottom: 2px solid var(--border); margin-bottom: 14px; }
.tt-tab {
  padding: 8px 18px; font-weight: 700; font-size: 13px; cursor: pointer;
  border: none; background: transparent; color: var(--muted);
  border-bottom: 3px solid transparent; margin-bottom: -2px;
  border-radius: 6px 6px 0 0; display: flex; align-items: center; gap: 6px;
  font-family: inherit; transition: color 0.12s;
}
.tt-tab:hover { color: var(--text); background: var(--card2); }
.tt-tab.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--card2); }
.tt-tab .tt-tab-count {
  background: var(--card3); color: var(--muted); border-radius: 99px;
  font-size: 10px; font-weight: 800; padding: 1px 7px; min-width: 22px; text-align: center;
}
.tt-tab.active .tt-tab-count { background: rgba(246,166,10,0.18); color: var(--accent); }

/* ─── sheet header ─── */
.tt-sheet-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 14px; background: var(--card2); border-bottom: 1px solid var(--border);
  gap: 8px; flex-wrap: wrap;
}
.tt-sheet-title { font-weight: 800; font-size: 13px; letter-spacing: 0.4px; }
.tt-sheet-sub { font-size: 10.5px; color: var(--muted); margin-top: 2px; }

/* ─── quick update popover ─── */
.tt-quick-pop {
  position: absolute; right: 0; top: 100%; margin-top: 6px; z-index: 81;
  background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  box-shadow: var(--sh-raise); padding: 12px; width: 300px; display: grid; gap: 10px;
}
`;

export default function TandaTerimaPage({ w }: Props) {
  const [records, setRecords] = useState<TandaTerima[] | null>(null);
  const [missingTable, setMissingTable] = useState(false);
  const [view, setView] = useState<View>('harian');
  const [selectedDate, setSelectedDate] = useState(today());
  const [allDates, setAllDates] = useState(false);
  const [category, setCategory] = useState<Category>('GMS');
  const [selectedAngkutan, setSelectedAngkutan] = useState('');
  const [q, setQ] = useState('');
  const [riwayatQ, setRiwayatQ] = useState('');
  const [pasteValue, setPasteValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [mode, setMode] = useState<QuickMode>('kirim');
  const [quickSdo, setQuickSdo] = useState('');
  const quickRef = useRef<HTMLInputElement>(null);
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeDari, setRangeDari] = useState('');
  const [rangeSampai, setRangeSampai] = useState('');
  const [draft, setDraft] = useState<TandaTerima | null>(null);
  const [tungguFor, setTungguFor] = useState<TandaTerima | null>(null);
  const [moveFor, setMoveFor] = useState<TandaTerima | null>(null);
  const [riwayatOpen, setRiwayatOpen] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dateMode, setDateMode] = useState<'print' | 'delv'>('print');
  const [blomSetor, setBlomSetor] = useState(false);

  const admin = isAdmin(w.user?.role);
  const supa = w.supabase;

  const loadRecords = async () => {
    // Supabase default max 1000 per request — loop sampai semua data ter-load
    const allData: TandaTerima[] = [];
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supa
        .from('tanda_terima')
        .select('*')
        .order('print_date', { ascending: false })
        .order('sdo', { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) {
        const msg = error.message || '';
        const isMissing = /could not find the table/i.test(msg) || /does not exist/i.test(msg) || /42P01/i.test(msg);
        if (isMissing) { setMissingTable(true); setRecords([]); return; }
        console.error('Gagal memuat tanda terima:', msg);
        w.triggerToast('Gagal memuat data. Pastikan tabel tanda_terima sudah dibuat & RLS aktif.', 'error');
        setRecords([]); return;
      }
      allData.push(...(data as TandaTerima[]));
      if (!data || data.length < PAGE) break; // sudah semua
      from += PAGE;
    }
    setMissingTable(false);
    setRecords(allData);
  };

  useEffect(() => {
    if (w.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.user]);

  // scroll + highlight baris yg dituju lewat quick-bar
  useEffect(() => {
    if (!highlightId) return;
    const el = document.querySelector(`[data-tt-row="${highlightId}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const t = setTimeout(() => setHighlightId(null), 2600);
    // eslint-disable-next-line consistent-return
    return () => clearTimeout(t);
  }, [highlightId]);

  const parsedRows = useMemo(() => parseTandaTerima(pasteValue), [pasteValue]);

  // SDO yang sudah ada di database (deteksi double sebelum simpan)
  const dupSet = useMemo(() => {
    const known = new Set((records || []).map(r => r.sdo));
    return new Set(parsedRows.filter(r => known.has(r.sdo)).map(r => r.sdo));
  }, [parsedRows, records]);

  const dayRows = useMemo(() => {
    if (allDates) return records || [];
    if (rangeMode && rangeDari && rangeSampai) {
      const col = dateMode === 'delv' ? 'delv_date' : 'print_date';
      return (records || []).filter(r => {
        const d = r[col];
        return d && d >= rangeDari && d <= rangeSampai;
      });
    }
    if (dateMode === 'delv') return (records || []).filter(r => r.delv_date === selectedDate);
    return (records || []).filter(r => r.print_date === selectedDate);
  }, [records, selectedDate, allDates, dateMode, rangeMode, rangeDari, rangeSampai]);

  const catCounts = useMemo(() => {
    const c: Record<Category, number> = { GMS: 0, TMS: 0, IMK: 0, Lainnya: 0 };
    dayRows.forEach(r => { c[rowCategory(r.angkutan)] += 1; });
    return c;
  }, [dayRows]);



  // DO tertunda: print_date < hari ini & belum terkirim/batal → notif "N hari blom kirim"
  const pendingRows = useMemo(() => {
    const t = today();
    return (records || []).filter(r =>
      r.print_date < t && (r.status_kirim === 'belum' || r.status_kirim === 'tunggu_info'));
  }, [records]);
  const pendingCount = pendingRows.length;
  const daysSince = (d: string | null) => {
    if (!d) return 0;
    return Math.max(0, Math.round((Date.parse(today() + 'T12:00:00') - Date.parse(d + 'T12:00:00')) / 86400000));
  };

  // Blom setor: udah terkirim tapi belum disetor ke pusat → telat setor = daysSince(delv_date).
  const blomSetorRows = useMemo(() =>
    (records || []).filter(r => r.status_kirim === 'terkirim' && r.status_setoran === 'belum'), [records]);
  const blomSetorCount = blomSetorRows.length;
  const TELAT_SETOR_HARI = 2; // ambang "telat"
  const telatSetorCount = blomSetorRows.filter(r => daysSince(r.delv_date) > TELAT_SETOR_HARI).length;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (r: TandaTerima) => !needle
      || r.sdo.toLowerCase().includes(needle)
      || (r.customer || '').toLowerCase().includes(needle)
      || (r.customer_code || '').toLowerCase().includes(needle);
    if (pending) return pendingRows.filter(match);
    if (blomSetor) return blomSetorRows.filter(match);
    if (needle) return dayRows.filter(match);  // search lintas kategori
    return dayRows.filter(r => rowCategory(r.angkutan) === category);
  }, [records, dayRows, category, q, pending, pendingRows, blomSetor, blomSetorRows]);

  const sheets = useMemo(() => {
    const map = new Map<string, TandaTerima[]>();
    filtered.forEach(r => {
      const key = r.angkutan || '— Tanpa Angkutan';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const angkutanNames = useMemo(() => {
    const set = new Set<string>();
    (w.angkutans || []).forEach(a => set.add(a.nama_angkutan));
    (records || []).forEach(r => r.angkutan && set.add(r.angkutan));
    return Array.from(set).sort();
  }, [w.angkutans, records]);

  // ── RIWAYAT per toko (lintas semua tanggal) ──
  const riwayatGroups = useMemo(() => {
    const needle = riwayatQ.trim().toLowerCase();
    const pool = (records || []).filter(r => r.status_kirim !== 'batal');
    const matched = !needle ? pool : pool.filter(r =>
      (r.customer || '').toLowerCase().includes(needle)
      || (r.customer_code || '').toLowerCase().includes(needle)
      || r.sdo.toLowerCase().includes(needle));
    const map = new Map<string, TandaTerima[]>();
    matched.forEach(r => {
      const key = r.customer_code || r.customer || r.sdo;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries())
      .map(([key, rows]) => {
        const sorted = [...rows].sort((a, b) => rowDate(b).localeCompare(rowDate(a)));
        const last = sorted[0];
        return {
          key, rows: sorted, name: last.customer || key, code: last.customer_code || '',
          lastAngkutan: last.angkutan || '—', lastDelv: last.delv_date || last.print_date,
          total: rows.length, terkirim: rows.filter(r => r.status_kirim === 'terkirim').length,
        };
      })
      .sort((a, b) => (b.lastDelv || '').localeCompare(a.lastDelv || ''))
      .slice(0, 200);
  }, [records, riwayatQ]);

  // ── simpan paste (upsert by sdo, preserve tracking; alert kalau double) ──
  const savePaste = async () => {
    if (!w.user || saving) return;
    const rows = parsedRows;
    if (rows.length === 0) { w.triggerToast('Format belum terbaca. Paste data DO mentah (tanpa kolom tracking).', 'error'); return; }
    if (!selectedAngkutan.trim()) { w.triggerToast('Isi nama transporter dulu (cth GMS 05).', 'error'); return; }
    // alert duplicate (cek di memori dulu)
    let skipExisting = false;
    if (dupSet.size > 0) {
      const list = [...dupSet].slice(0, 12).join(', ');
      const ok = window.confirm(
        `⚠️ ${dupSet.size} SDO sudah pernah diinput:\n${list}${dupSet.size > 12 ? ' …' : ''}\n\n` +
        `OK = update field pastenya (tracking kirim/setoran tetap utuh)\n` +
        `Batal = skip, cuma simpan ${rows.length - dupSet.size} SDO baru biar gak dobel`
      );
      if (!ok) skipExisting = true;
    }
    setSaving(true);
    try {
      const sdos = rows.map(r => r.sdo);
      const { data: existing } = await supa.from('tanda_terima').select('sdo').in('sdo', sdos);
      const existSet = new Set((existing || []).map(e => e.sdo as string));
      const ak = selectedAngkutan.trim();
      const toInsert = rows.filter(r => !existSet.has(r.sdo)).map(r => ({
        print_date: selectedDate, angkutan: ak, order_date: r.order_date, sdo: r.sdo,
        jadwal_kirim: r.jadwal_kirim, customer_code: r.customer_code, customer: r.customer,
        adres: r.adres, destination: r.destination, cement_type: r.cement_type,
        pack: r.pack, qty: r.qty, status_kirim: 'belum', status_setoran: 'belum', created_by: w.user!.id,
      }));
      const toUpdate = skipExisting ? [] : rows.filter(r => existSet.has(r.sdo));
      if (toInsert.length === 0 && toUpdate.length === 0) {
        w.triggerToast('Semua SDO sudah ada — tidak ada yang disimpan.');
        return;
      }
      if (toInsert.length) {
        const { error } = await supa.from('tanda_terima').insert(toInsert);
        if (error) throw error;
      }
      for (const r of toUpdate) {
        const { error } = await supa.from('tanda_terima').update({
          print_date: selectedDate, angkutan: ak, order_date: r.order_date,
          jadwal_kirim: r.jadwal_kirim, customer_code: r.customer_code, customer: r.customer,
          adres: r.adres, destination: r.destination, cement_type: r.cement_type, pack: r.pack, qty: r.qty,
        }).eq('sdo', r.sdo);
        if (error) throw error;
      }
      const ringkasan = `Paste ${toInsert.length} baru${toUpdate.length ? ` + update ${toUpdate.length}` : ''}${skipExisting ? ` (skip ${dupSet.size} double)` : ''} (${ak || '—'}, ${fmtDate(selectedDate)})`;
      await supa.from('audit_log').insert({ user_id: w.user.id, tabel: 'tanda_terima', aksi: 'UPSERT', ringkasan });
      w.triggerToast(`${toInsert.length} SDO baru tersimpan${toUpdate.length ? `, ${toUpdate.length} di-update` : ''}${ak ? ` untuk ${ak}` : ''}.`);
      setPasteValue(''); setShowPaste(false);
      await loadRecords();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Gagal simpan paste:', msg);
      w.triggerToast(`Gagal menyimpan: ${msg}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const patchRow = async (r: TandaTerima, patch: Partial<TandaTerima>, ringkasan: string) => {
    if (!w.user) return;
    const { error } = await supa.from('tanda_terima').update(patch).eq('id', r.id);
    if (error) {
      console.error('patchRow gagal:', error.message, patch);
      w.triggerToast(`Gagal: ${error.message}`, 'error');
      return;
    }
    await supa.from('audit_log').insert({ user_id: w.user.id, tabel: 'tanda_terima', aksi: 'UPDATE', ringkasan });
    w.triggerToast(ringkasan);
    await loadRecords();
  };

  const toggleKirim = (r: TandaTerima) => {
    if (r.status_kirim === 'terkirim' || r.status_kirim === 'batal') {
      patchRow(r, { status_kirim: 'belum', alasan_tunggu: null, delv_date: null }, `SDO ${r.sdo} → belum kirim`);
    } else {
      patchRow(r, { status_kirim: 'terkirim', delv_date: today(), alasan_tunggu: null }, `SDO ${r.sdo} → terkirim`);
    }
  };
  const pickTunggu = (r: TandaTerima, alasan: string) =>
    patchRow(r, { status_kirim: 'tunggu_info', alasan_tunggu: alasan }, `SDO ${r.sdo} → tunggu info`);
  const batalkan = (r: TandaTerima) =>
    patchRow(r, { status_kirim: 'batal', alasan_tunggu: null, delv_date: null }, `SDO ${r.sdo} → batal`);
  const toggleSetoran = (r: TandaTerima) => {
    if (r.status_setoran === 'belum') {
      patchRow(r, { status_setoran: 'disetor', setoran_note: SETORAN_DEFAULT_NOTE }, `SDO ${r.sdo} → disetor`);
    } else {
      patchRow(r, { status_setoran: 'belum', setoran_note: null }, `SDO ${r.sdo} → belum setor`);
    }
  };
  // set-only (buat quick-bar): set ke disetor, gak toggle balik
  const markDisetor = (r: TandaTerima) =>
    patchRow(r, { status_setoran: 'disetor', setoran_note: SETORAN_DEFAULT_NOTE }, `SDO ${r.sdo} → disetor`);
  const moveAngkutan = (r: TandaTerima, ak: string) =>
    patchRow(r, { angkutan: ak }, `SDO ${r.sdo} → angkutan ${ak}`);

  const hapusRow = async (r: TandaTerima) => {
    if (!w.user) return;
    if (!confirm(`Hapus permanen SDO ${r.sdo}?\nData tidak bisa dikembalikan.`)) return;
    const { error } = await supa.from('tanda_terima').delete().eq('id', r.id);
    if (error) { w.triggerToast(`Gagal hapus: ${error.message}`, 'error'); return; }
    await supa.from('audit_log').insert({ user_id: w.user.id, tabel: 'tanda_terima', aksi: 'DELETE', ringkasan: `Hapus SDO ${r.sdo}` });
    w.triggerToast(`SDO ${r.sdo} dihapus.`);
    await loadRecords();
  };

  const applyQuick = async () => {
    const sdo = quickSdo.trim();
    if (!sdo) return;
    // GLOBAL: cari lintas SEMUA record (semua tanggal & angkutan), bukan cuma view skrg.
    const r = (records || []).find(x => x.sdo === sdo || x.sdo.endsWith(sdo));
    if (!r) { w.triggerToast(`SDO ${sdo} tidak ditemukan.`, 'error'); return; }
    // alert kalau udah ke-update (gak bisa asal berulang)
    if (mode === 'kirim' && r.status_kirim === 'terkirim') {
      w.triggerToast(`SDO ${r.sdo} sudah terkirim${r.delv_date ? ` (${fmtDate(r.delv_date)})` : ''}.`, 'error');
      setHighlightId(r.id); setQuickSdo(''); quickRef.current?.focus();
      return;
    }
    if (mode === 'setoran' && r.status_setoran === 'disetor') {
      w.triggerToast(`SDO ${r.sdo} sudah disetor.`, 'error');
      setHighlightId(r.id); setQuickSdo(''); quickRef.current?.focus();
      return;
    }
    // auto-navigate ke baris itu (gak perlu lo pindah manual), lalu update.
    setAllDates(false);
    setSelectedDate(r.print_date);
    setCategory(rowCategory(r.angkutan));
    if (mode === 'kirim') await toggleKirim(r); else await markDisetor(r);
    setHighlightId(r.id);  // scroll + highlight setelah render
    setQuickSdo(''); quickRef.current?.focus();
  };

  const exportSheet = async (name: string, rows: TandaTerima[]) => {
    const cols = ['No','PRINT DATE','ORDER DATE','SDO','JADWAL KIRIM','CUSTOMER CODE',
      'CUSTOMER','ADRES','DESTINATION','CEMENT TYPE','PACK','.','QTY','STATUS','DELV DATE','SETORAN']
      .map(h => ({ header: h, width: h === 'ADRES' ? 42 : 14 }));
    const dataRows = rows.map((r, i) => [
      i + 1, fmtDate(r.print_date), r.order_date ? fmtDate(r.order_date) : '', r.sdo,
      r.jadwal_kirim ? fmtDate(r.jadwal_kirim) : '', r.customer_code || '', r.customer || '',
      r.adres || '', r.destination || '', r.cement_type || '', r.pack || '', '.',
      r.qty ?? '', statusKirimLabelEn[r.status_kirim] || r.status_kirim,
      r.delv_date ? fmtDate(r.delv_date) : '',
      r.status_setoran === 'disetor' ? (r.setoran_note || SETORAN_DEFAULT_NOTE) : '',
    ]);
    const safeName = (name === '— Tanpa Angkutan' ? 'Tanpa_Angkutan' : name).replace(/[\\/?*[\]:]/g, ' ').slice(0, 28);
    const dateSuffix = rangeMode && rangeDari && rangeSampai
      ? `${rangeDari}_sd_${rangeSampai}`
      : allDates ? 'ALL' : selectedDate;
    await downloadXlsx(`Tanda_Terima_${safeName}_${dateSuffix}`, [{ name: safeName, cols, rows: dataRows }]);
  };

  const exportCategory = async () => {
    for (const [name, rows] of sheets) {
      // eslint-disable-next-line no-await-in-loop
      await exportSheet(name, rows);
    }
  };

  // ─── render: missing table ───
  if (missingTable) {
    return (
      <div>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <div><div className="section-title">Tanda Terima DO</div>
            <div className="section-subtitle">Catat tanda terima DO per angkutan & lacak kirim/setoran.</div></div>
        </div>
        <div className="card">
          <div className="flex-row" style={{ gap: 12, marginBottom: 14 }}>
            <div className="tb-icon-chip"><ClipboardPaste /></div>
            <div>
              <div className="font-bold" style={{ fontSize: 16 }}>Tabel database belum dibuat</div>
              <div className="text-sm text-muted" style={{ marginTop: 2 }}>
                Fitur ini butuh tabel <b style={{ fontFamily: 'monospace' }}>tanda_terima</b> di Supabase-mu.
              </div>
            </div>
          </div>
          <ol style={{ paddingLeft: 20, display: 'grid', gap: 8, fontSize: 13.5, color: 'var(--text-sub)' }}>
            <li>Buka <b>Supabase Dashboard → SQL Editor</b>.</li>
            <li>Jalankan file <b style={{ fontFamily: 'monospace' }}>supabase/tanda-terima.sql</b>:
              <details style={{ marginTop: 6 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>Lihat & salin SQL</summary>
                <pre style={{
                  marginTop: 8, maxHeight: 280, overflow: 'auto', whiteSpace: 'pre-wrap',
                  background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 12,
                  padding: '12px 14px', fontFamily: 'monospace', fontSize: 11.5, color: 'var(--text-sub)',
                }}>{SETUP_SQL}</pre>
              </details>
            </li>
            <li>Klik <b>“Muat Ulang”</b>.</li>
          </ol>
          <div className="flex-row" style={{ gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => { setRecords(null); void loadRecords(); }}>Muat Ulang</button>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = records === null;

  return (
    <div>
      <style>{COMPACT_CSS}</style>

      {/* ── HEADER ── */}
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <div>
          <div className="section-title">Tanda Terima DO</div>
          <div className="section-subtitle">
            {view === 'riwayat' ? 'Riwayat per toko · semua tanggal'
              : allDates ? `Semua · ${(records || []).length} SDO`
              : rangeMode && rangeDari && rangeSampai ? `${fmtDate(rangeDari)} — ${fmtDate(rangeSampai)} · ${dayRows.length} DO`
              : dateMode === 'delv' ? `Kirim ${fmtDate(selectedDate)}`
              : `${monthLabel(selectedDate)} · ${fmtDate(selectedDate)}`}
          </div>
        </div>
        <div className="flex-row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {/* view toggle */}
          <div className="seg" style={{ width: 'auto' }}>
            <button type="button"
              style={{ background: view === 'harian' ? 'var(--accent)' : 'transparent', color: view === 'harian' ? '#211500' : 'var(--muted)' }}
              onClick={() => setView('harian')}>Harian</button>
            <button type="button"
              style={{ background: view === 'riwayat' ? 'var(--accent)' : 'transparent', color: view === 'riwayat' ? '#211500' : 'var(--muted)' }}
              onClick={() => setView('riwayat')}>
              <History style={{ width: 13, height: 13 }} /> Riwayat
            </button>
          </div>
          {view === 'harian' && admin && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPaste(s => !s)}>
              <ClipboardPaste style={{ width: 14, height: 14 }} /> Paste
            </button>
          )}
        </div>
      </div>

      {view === 'riwayat' ? (
        <RiwayatView
          riwayatQ={riwayatQ} setRiwayatQ={setRiwayatQ}
          groups={riwayatGroups} openKey={riwayatOpen} setOpenKey={setRiwayatOpen}
          angkutanNames={angkutanNames} admin={admin}
          onMove={moveAngkutan} onEdit={setDraft} onToggleKirim={toggleKirim} onToggleSetoran={toggleSetoran}
        />
      ) : (
        <>
          {/* ── ALERT CHIPS — compact 1 baris ── */}
          {(pendingCount > 0 || blomSetorCount > 0) && (
            <div className="tt-alert-bar">
              {pendingCount > 0 && (
                <button className={`tt-alert-chip danger${pending ? ' active-danger' : ''}`}
                  onClick={() => { setPending(p => !p); setBlomSetor(false); }}>
                  ⚡ <span className="num">{pendingCount}</span> belum kirim
                  {pending && ' ✕'}
                </button>
              )}
              {blomSetorCount > 0 && (
                <button className={`tt-alert-chip warn${blomSetor ? ' active-warn' : ''}`}
                  onClick={() => { setBlomSetor(b => !b); setPending(false); }}>
                  💰 <span className="num">{blomSetorCount}</span> belum setor
                  {telatSetorCount > 0 && <span style={{ fontSize: 10, opacity: 0.8 }}> · {telatSetorCount} telat</span>}
                  {blomSetor && ' ✕'}
                </button>
              )}
            </div>
          )}

          {/* ── FILTER TOOLBAR ── */}
          <div className="tt-toolbar">
            {/* kolom tanggal: print atau delv */}
            <span className="tt-toolbar-label">Berdasar</span>
            <div className="seg" style={{ width: 'auto' }}>
              <button type="button"
                style={{ background: dateMode === 'print' ? 'var(--accent)' : 'transparent', color: dateMode === 'print' ? '#211500' : 'var(--muted)' }}
                onClick={() => { setDateMode('print'); setAllDates(false); setRangeMode(false); }}>Print</button>
              <button type="button"
                style={{ background: dateMode === 'delv' ? 'var(--success)' : 'transparent', color: dateMode === 'delv' ? '#fff' : 'var(--muted)' }}
                onClick={() => { setDateMode('delv'); setAllDates(false); setRangeMode(false); }}>Kirim</button>
            </div>

            <span className="tt-toolbar-label" style={{ marginLeft: 4 }}>Tanggal</span>
            {/* mode selector: hari / range / semua */}
            <div className="seg" style={{ width: 'auto' }}>
              <button type="button"
                style={{ background: !rangeMode && !allDates ? 'var(--card3)' : 'transparent', color: !rangeMode && !allDates ? 'var(--text)' : 'var(--muted)' }}
                onClick={() => { setRangeMode(false); setAllDates(false); }}>Hari</button>
              <button type="button"
                style={{ background: rangeMode ? 'var(--accent2)' : 'transparent', color: rangeMode ? '#fff' : 'var(--muted)' }}
                onClick={() => { setRangeMode(true); setAllDates(false); }}>Range</button>
              <button type="button"
                style={{ background: allDates ? 'var(--accent)' : 'transparent', color: allDates ? '#211500' : 'var(--muted)' }}
                onClick={() => { setAllDates(true); setRangeMode(false); }}>Semua</button>
            </div>

            {/* input nilai tanggal */}
            {!rangeMode && !allDates && (
              <input aria-label="Tanggal" type="date" value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ width: 145 }} />
            )}
            {rangeMode && (
              <>
                <input aria-label="Dari" type="date" value={rangeDari}
                  onChange={e => setRangeDari(e.target.value)} style={{ width: 135 }} />
                <span style={{ color: 'var(--muted)', fontWeight: 700 }}>—</span>
                <input aria-label="Sampai" type="date" value={rangeSampai}
                  onChange={e => setRangeSampai(e.target.value)} style={{ width: 135 }} />
              </>
            )}

            {/* search */}
            <div className="search-box" style={{ flex: '1 1 160px', marginLeft: 'auto' }}>
              <Search />
              <input placeholder="Cari SDO / customer…" value={q} onChange={e => setQ(e.target.value)} />
            </div>

            {/* quick update */}
            {admin && (
              <QuickPopover mode={mode} setMode={setMode} quickSdo={quickSdo} setQuickSdo={setQuickSdo}
                apply={applyQuick} quickRef={quickRef} records={records || []}
                pending={pending} setPending={setPending}
                blomSetor={blomSetor} setBlomSetor={setBlomSetor}
                pendingCount={pendingCount} blomSetorCount={blomSetorCount} telatSetorCount={telatSetorCount} />
            )}
          </div>

          {/* ── TABS GMS / TMS / IMK ── */}
          <div className="tt-tabs">
            {FLEETS.map(c => (
              <button key={c} className={`tt-tab${category === c ? ' active' : ''}`}
                onClick={() => setCategory(c)}>
                {c}
                <span className="tt-tab-count">{catCounts[c]}</span>
              </button>
            ))}
          </div>

          {/* Panel paste */}
          {admin && showPaste && (
            <div className="card" style={{ padding: '12px 14px', marginBottom: 14 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <div className="card-title">Paste DO — {fmtDate(selectedDate)}</div>
                <button className="btn btn-ghost btn-sm icon-btn" onClick={() => setShowPaste(false)}><X size={14} /></button>
              </div>
              <div className="flex-row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
                <label className="text-muted text-sm" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Angkutan</label>
                <input aria-label="Angkutan" list="tt-angkutan-list" placeholder="cth: GMS 05"
                  value={selectedAngkutan} onChange={e => setSelectedAngkutan(e.target.value)}
                  style={{ flex: '1 1 200px' }} />
                <datalist id="tt-angkutan-list">{angkutanNames.map(n => <option key={n} value={n} />)}</datalist>
              </div>
              <textarea value={pasteValue} onChange={e => setPasteValue(e.target.value)}
                placeholder="Tempel baris DO di sini…" style={{ minHeight: 90, marginBottom: 8 }} />
              <div className="flex-between">
                <span className="text-muted text-sm">
                  {parsedRows.length} SDO siap simpan
                  {dupSet.size > 0 && <span className="text-danger" style={{ fontWeight: 700 }}> · {dupSet.size} double</span>}
                </span>
                <button className="btn btn-primary" onClick={() => void savePaste()} disabled={saving}>
                  {saving ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
              {dupSet.size > 0 && (
                <div className="alert alert-warn" style={{ marginTop: 8, fontSize: 12 }}>
                  ⚠ {dupSet.size} SDO sudah ada: {[...dupSet].slice(0, 8).join(', ')}{dupSet.size > 8 ? ' …' : ''} — konfirmasi update/skip saat simpan.
                </div>
              )}
            </div>
          )}

          {allDates && filtered.length > 1500 && (
            <div className="alert alert-warn" style={{ marginBottom: 10, fontSize: 12 }}>
              💡 {filtered.length} baris. Pakai search biar lebih ringan.
            </div>
          )}

          {/* ── TABEL PER TRANSPORTER ── */}
          {isLoading ? (
            <div className="empty-state">Memuat tanda terima…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {pending ? 'Tidak ada DO tertunda.' : blomSetor ? 'Semua DO sudah disetor.' : q ? 'Tidak ditemukan.' : `Belum ada tanda terima ${category} untuk ${fmtDate(selectedDate)}.${admin ? ' Klik Paste untuk tambah.' : ''}`}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 18 }}>
              {sheets.map(([name, rows]) => (
                <div key={name} className="tt-compact" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div className="tt-sheet-head">
                    <div>
                      <div className="tt-sheet-title">{name}</div>
                      <div className="tt-sheet-sub">{rows.length} DO · {allDates ? 'semua tanggal' : rangeMode && rangeDari && rangeSampai ? `${fmtDate(rangeDari)} — ${fmtDate(rangeSampai)}` : monthLabel(selectedDate)}</div>
                    </div>
                    <button className="btn btn-blue btn-sm" onClick={() => void exportSheet(name, rows)}>
                      <Download style={{ width: 13, height: 13 }} /> Excel
                    </button>
                  </div>
                  <div className="table-wrap" style={{ border: 'none' }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: 26 }}>#</th>
                          <th className="tt-col-date">PRINT</th>
                          <th className="tt-col-date">ORDER</th>
                          <th>SDO</th>
                          <th>CUSTOMER</th>
                          <th className="tt-col-dest">DEST</th>
                          <th className="tt-col-cement">SEMEN</th>
                          <th style={{ width: 46, textAlign: 'right' }}>QTY</th>
                          <th style={{ minWidth: 90 }}>STATUS KIRIM</th>
                          <th className="tt-col-delv">DELV</th>
                          <th style={{ minWidth: 80 }}>SETOR</th>
                          {admin && <th style={{ width: 32 }} />}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => {
                          const telat = r.print_date < today() && (r.status_kirim === 'belum' || r.status_kirim === 'tunggu_info');
                          const telatSetor = r.status_kirim === 'terkirim' && r.status_setoran === 'belum' && r.delv_date;
                          return (
                            <tr key={r.id} data-tt-row={r.id}
                              className={highlightId === r.id ? 'tt-flash' : undefined}
                              style={r.status_kirim === 'batal' ? { opacity: 0.45 } : undefined}>
                              <td style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>{i + 1}</td>
                              <td className="tt-col-date" style={{ whiteSpace: 'nowrap', color: 'var(--text-sub)' }}>{fmtDate(r.print_date)}</td>
                              <td className="tt-col-date" style={{ whiteSpace: 'nowrap', color: 'var(--text-sub)' }}>{r.order_date ? fmtDate(r.order_date) : '—'}</td>
                              <td className="font-bold" style={{ fontFamily: 'monospace', whiteSpace: 'nowrap', color: 'var(--accent)', letterSpacing: '0.5px' }}>
                                {r.sdo}
                              </td>
                              <td style={{ minWidth: 0, maxWidth: 170 }}>
                                <div className="font-bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.customer || '—'}</div>
                                {r.customer_code && <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'monospace', marginTop: 1 }}>{r.customer_code}</div>}
                              </td>
                              <td className="tt-col-dest" style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-sub)' }}>{r.destination || '—'}</td>
                              <td className="tt-col-cement" style={{ whiteSpace: 'nowrap', color: 'var(--text-sub)' }}>
                                {r.cement_type || '—'}{r.pack && <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 4 }}>{r.pack}</span>}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 700 }}>{r.qty != null ? fmt(r.qty) : '—'}</td>

                              {/* STATUS KIRIM — badge klikable + info telat */}
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                  {admin ? (
                                    <>
                                      <button className={`badge ${statusKirimBadge[r.status_kirim]}`}
                                        style={{ border: 'none', cursor: 'pointer', padding: '3px 9px', fontFamily: 'inherit' }}
                                        onClick={() => void toggleKirim(r)} title="Klik toggle">
                                        {statusKirimLabel[r.status_kirim]}
                                      </button>
                                      {r.status_kirim !== 'batal' && (
                                        <button className="btn btn-ghost btn-sm icon-btn" style={{ padding: '1px 2px' }}
                                          title="Set Tunggu Info" onClick={() => setTungguFor(r)}>
                                          <ChevronDown size={11} />
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span className={`badge ${statusKirimBadge[r.status_kirim]}`}>{statusKirimLabel[r.status_kirim]}</span>
                                  )}
                                </div>
                                {r.status_kirim === 'tunggu_info' && r.alasan_tunggu && (
                                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{r.alasan_tunggu}</div>
                                )}
                                {telat && (
                                  <div style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 800, marginTop: 2 }}>
                                    ⚠ {daysSince(r.print_date)}h blom kirim
                                  </div>
                                )}
                              </td>

                              <td className="tt-col-delv" style={{ whiteSpace: 'nowrap', color: 'var(--text-sub)' }}>
                                {r.delv_date ? fmtDate(r.delv_date) : '—'}
                              </td>

                              {/* SETOR */}
                              <td>
                                {admin ? (
                                  <button className={`badge ${statusSetoranBadge[r.status_setoran]}`}
                                    style={{ border: 'none', cursor: 'pointer', padding: '3px 9px', fontFamily: 'inherit' }}
                                    onClick={() => void toggleSetoran(r)} title="Klik toggle">
                                    {statusSetoranLabel[r.status_setoran]}
                                  </button>
                                ) : (
                                  <span className={`badge ${statusSetoranBadge[r.status_setoran]}`}>{statusSetoranLabel[r.status_setoran]}</span>
                                )}
                                {telatSetor && (
                                  <div style={{ fontSize: 10, fontWeight: 800, marginTop: 2, color: daysSince(r.delv_date) > 2 ? 'var(--danger)' : 'var(--warn)' }}>
                                    {daysSince(r.delv_date)}h blom setor
                                  </div>
                                )}
                              </td>

                              {admin && (
                                <td style={{ textAlign: 'center' }}>
                                  <RowActions r={r} onMove={setMoveFor} onBatal={batalkan} onEdit={setDraft} onHapus={hapusRow} />
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Popover alasan tunggu */}
      {tungguFor && (
        <div className="modal-overlay" onClick={() => setTungguFor(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Tunggu Info — {tungguFor.sdo}</div>
              <button className="modal-close" onClick={() => setTungguFor(null)}><X size={15} /></button>
            </div>
            <div style={{ display: 'grid', gap: 6, padding: '4px 0' }}>
              {ALASAN_TUNGU.map(a => (
                <button key={a} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}
                  onClick={() => { void pickTunggu(tungguFor, a); setTungguFor(null); }}>{a}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popover pindah angkutan */}
      {moveFor && (
        <div className="modal-overlay" onClick={() => setMoveFor(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Pindah Angkutan — {moveFor.sdo}</div>
              <button className="modal-close" onClick={() => setMoveFor(null)}><X size={15} /></button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div className="text-xs text-muted">Sekarang: <b>{moveFor.angkutan || '—'}</b></div>
            </div>
            <MovePicker angkutanNames={angkutanNames} onPick={ak => { void moveAngkutan(moveFor, ak); setMoveFor(null); }} />
          </div>
        </div>
      )}

      {/* Modal edit */}
      {draft && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">Ubah — {draft.sdo}</div>
              <button className="modal-close" onClick={() => setDraft(null)}><X size={15} /></button>
            </div>
            <EditForm draft={draft} setDraft={setDraft} />
            <div className="flex-row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <button className="btn btn-ghost" onClick={() => setDraft(null)}>Batal</button>
              <button className="btn btn-primary" onClick={() => {
                void patchRow(draft, {
                  print_date: draft.print_date, angkutan: draft.angkutan, order_date: draft.order_date,
                  jadwal_kirim: draft.jadwal_kirim, customer_code: draft.customer_code, customer: draft.customer,
                  adres: draft.adres, destination: draft.destination, cement_type: draft.cement_type,
                  pack: draft.pack, qty: draft.qty, delv_date: draft.delv_date, status_kirim: draft.status_kirim,
                  alasan_tunggu: draft.alasan_tunggu, status_setoran: draft.status_setoran,
                  setoran_note: draft.setoran_note, catatan: draft.catatan,
                }, `Ubah SDO ${draft.sdo}`).then(() => setDraft(null));
              }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Riwayat per toko ─────────────────────────────────────────────────────────
interface RiwayatGroup {
  key: string; rows: TandaTerima[]; name: string; code: string;
  lastAngkutan: string; lastDelv: string | null; total: number; terkirim: number;
}

function RiwayatView(props: {
  riwayatQ: string; setRiwayatQ: (s: string) => void; groups: RiwayatGroup[];
  openKey: string | null; setOpenKey: (s: string | null) => void;
  angkutanNames: string[]; admin: boolean;
  onMove: (r: TandaTerima, ak: string) => void; onEdit: (r: TandaTerima) => void;
  onToggleKirim: (r: TandaTerima) => void; onToggleSetoran: (r: TandaTerima) => void;
}) {
  const { riwayatQ, setRiwayatQ, groups, openKey, setOpenKey, admin } = props;
  return (
    <>
      <div className="flex-row" style={{ gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div className="search-box" style={{ flex: '1 1 300px' }}>
          <Search />
          <input placeholder="Cari toko / kode toko / SDO (lintas semua tanggal)…"
            value={riwayatQ} onChange={e => setRiwayatQ(e.target.value)} />
        </div>
        <span className="text-xs text-muted">{groups.length} toko · diurut dari kirim terbaru</span>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          {riwayatQ ? 'Tidak ditemukan.' : 'Ketik nama toko / kode toko di atas.'}
        </div>
      ) : (
        <div className="table-wrap resp-table tt-compact">
          <table>
            <thead>
              <tr>
                <th style={{ width: 34 }} /><th>Toko</th><th>Kode</th>
                <th>Angkutan Terakhir</th><th>Kirim Terakhir</th>
                <th>Total DO</th><th>Terkirim</th><th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => {
                const open = openKey === g.key;
                return (
                  <React.Fragment key={g.key}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => setOpenKey(open ? null : g.key)}>
                      <td style={{ textAlign: 'center' }}>
                        <ChevronDown style={{ width: 14, height: 14, color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </td>
                      <td className="font-bold">{g.name}</td>
                      <td className="text-accent" style={{ fontFamily: 'monospace' }}>{g.code || '—'}</td>
                      <td>{g.lastAngkutan}</td>
                      <td>{g.lastDelv ? fmtDate(g.lastDelv) : '—'}</td>
                      <td className="font-bold">{g.total}</td>
                      <td><span className="badge b-green">{g.terkirim}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setOpenKey(open ? null : g.key); }}>
                          {open ? 'Tutup' : 'Lihat DO'}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="sj-detail-row">
                        <td colSpan={8} style={{ background: 'var(--card2)' }}>
                          <div className="table-wrap tt-compact" style={{ border: 'none', margin: 0 }}>
                            <table>
                              <thead><tr><th>Print</th><th>SDO</th><th>Angkutan</th><th>Semen</th><th>Qty</th><th>Status</th><th>Delv</th><th>Setor</th>{admin && <th>Aksi</th>}</tr></thead>
                              <tbody>
                                {g.rows.map(r => (
                                  <tr key={r.id}>
                                    <td>{fmtDate(r.print_date)}</td>
                                    <td className="font-bold text-accent" style={{ fontFamily: 'monospace' }}>{r.sdo}</td>
                                    <td>{r.angkutan || '—'}</td>
                                    <td>{r.cement_type || '—'}</td>
                                    <td className="font-bold">{r.qty != null ? fmt(r.qty) : '—'}</td>
                                    <td><span className={`badge ${statusKirimBadge[r.status_kirim]}`}>{statusKirimLabel[r.status_kirim]}</span></td>
                                    <td>{r.delv_date ? fmtDate(r.delv_date) : '—'}</td>
                                    <td><span className={`badge ${statusSetoranBadge[r.status_setoran]}`}>{statusSetoranLabel[r.status_setoran]}</span></td>
                                    {admin && (
                                      <td className="sj-actions" style={{ whiteSpace: 'nowrap' }}>
                                        <button className="btn btn-ghost btn-sm icon-btn" title="Pindah" onClick={() => props.onEdit(r)}><Pencil size={13} /></button>
                                        <button className="btn btn-ghost btn-sm icon-btn" title="Toggle kirim" onClick={() => props.onToggleKirim(r)}><Truck size={13} /></button>
                                        <button className="btn btn-ghost btn-sm icon-btn" title="Toggle setor" onClick={() => props.onToggleSetoran(r)}><Stamp size={13} /></button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
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
    </>
  );
}

// ─── Picker pindah angkutan ───────────────────────────────────────────────────
function MovePicker({ angkutanNames, onPick }: { angkutanNames: string[]; onPick: (ak: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <div className="flex-row" style={{ gap: 6 }}>
      <input list="tt-move-list" placeholder="Ketik / pilih angkutan tujuan…"
        value={val} onChange={e => setVal(e.target.value)} style={{ flex: 1 }} />
      <datalist id="tt-move-list">{angkutanNames.map(n => <option key={n} value={n} />)}</datalist>
      <button className="btn btn-primary btn-sm" onClick={() => val.trim() && onPick(val.trim())}>Pindah</button>
    </div>
  );
}

// ─── Popover Quick-update + alert filter (1 tombol biar bar gak rame) ──────────
function QuickPopover(props: {
  mode: QuickMode; setMode: (m: QuickMode) => void;
  quickSdo: string; setQuickSdo: (s: string) => void; apply: () => void;
  quickRef: React.RefObject<HTMLInputElement | null>; records: TandaTerima[];
  pending: boolean; setPending: (f: boolean | ((p: boolean) => boolean)) => void;
  blomSetor: boolean; setBlomSetor: (f: boolean | ((b: boolean) => boolean)) => void;
  pendingCount: number; blomSetorCount: number; telatSetorCount: number;
}) {
  const [open, setOpen] = useState(false);
  const total = props.pendingCount + props.blomSetorCount;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)} title="Update cepat & filter alert"
        style={{ position: 'relative' }}>
        ⚡ Update
        {total > 0 && <span className="badge b-red" style={{ fontSize: 9, padding: '0 5px', marginLeft: 3 }}>{total}</span>}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 80 }} onClick={() => setOpen(false)} />
          <div onClick={e => e.stopPropagation()} className="tt-quick-pop">
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>Update cepat</div>
            <div className="seg" style={{ width: '100%' }}>
              <button type="button" style={{ flex: 1, justifyContent: 'center', background: props.mode === 'kirim' ? 'var(--accent)' : 'transparent', color: props.mode === 'kirim' ? '#211500' : 'var(--muted)' }}
                onClick={() => { props.setMode('kirim'); props.quickRef.current?.focus(); }}><Truck style={{ width: 13, height: 13 }} /> Kirim</button>
              <button type="button" style={{ flex: 1, justifyContent: 'center', background: props.mode === 'setoran' ? 'var(--success)' : 'transparent', color: props.mode === 'setoran' ? '#fff' : 'var(--muted)' }}
                onClick={() => { props.setMode('setoran'); props.quickRef.current?.focus(); }}><Stamp style={{ width: 13, height: 13 }} /> Setoran</button>
            </div>
            <div className="search-box" style={{ flex: '1 1 100%' }}>
              <Search />
              <input ref={props.quickRef} list="tt-sdo-list" placeholder="Ketik SDO + Enter… (lintas semua)"
                value={props.quickSdo} onChange={e => props.setQuickSdo(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); props.apply(); } }} />
              <datalist id="tt-sdo-list">{props.records.map(r => <option key={r.id} value={r.sdo}>{`${r.sdo} · ${r.customer || ''}`}</option>)}</datalist>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => props.apply()}>Apply</button>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'grid', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>Filter alert</div>
              {props.pendingCount > 0 && (
                <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', color: props.pending ? 'var(--danger)' : 'var(--text-sub)' }}
                  onClick={() => { props.setPending(p => !p); props.setBlomSetor(false); }}>
                  ⚡ Tertunda blom kirim ({props.pendingCount})
                </button>
              )}
              {props.blomSetorCount > 0 && (
                <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', color: props.blomSetor ? 'var(--warn)' : 'var(--text-sub)' }}
                  onClick={() => { props.setBlomSetor(b => !b); props.setPending(false); }}>
                  💰 Blom setor ({props.blomSetorCount}){props.telatSetorCount > 0 ? ` · ${props.telatSetorCount} telat` : ''}
                </button>
              )}
              {total === 0 && <span className="text-muted text-sm">Tidak ada alert 👍</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RowActions({ r, onMove, onBatal, onEdit, onHapus }: {
  r: TandaTerima;
  onMove: (r: TandaTerima) => void;
  onBatal: (r: TandaTerima) => void;
  onEdit: (r: TandaTerima) => void;
  onHapus: (r: TandaTerima) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropH = 140;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < dropH ? rect.top - dropH - 4 : rect.bottom + 4;
      setPos({ top, right: window.innerWidth - rect.right });
    }
    setOpen(o => !o);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <button ref={btnRef} className="btn btn-ghost btn-sm icon-btn" onClick={toggle} title="Aksi">
        <MoreVertical size={14} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div onClick={e => e.stopPropagation()} style={{
            position: 'fixed', zIndex: 91, top: pos.top, right: pos.right,
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
            boxShadow: 'var(--sh-raise)', padding: 6, display: 'grid', gap: 4, minWidth: 180,
          }}>
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => { setOpen(false); onMove(r); }}><Truck size={13} /> Pindah Angkutan</button>
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--danger)' }}
              onClick={() => { setOpen(false); void onBatal(r); }}><X size={13} /> Batalkan DO</button>
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => { setOpen(false); onEdit(r); }}><Pencil size={13} /> Ubah</button>
            <div style={{ borderTop: '1px solid var(--border)', margin: '2px 0' }} />
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--danger)', fontWeight: 700 }}
              onClick={() => { setOpen(false); onHapus(r); }}>
              <X size={13} /> Hapus Permanen
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Form edit ────────────────────────────────────────────────────────────────
function EditForm({ draft, setDraft }: { draft: TandaTerima; setDraft: (d: TandaTerima) => void }) {
  const set = (patch: Partial<TandaTerima>) => setDraft({ ...draft, ...patch });
  return (
    <div className="form-grid" style={{ marginBottom: 4 }}>
      <div className="form-group"><label>Print Date</label><input type="date" value={draft.print_date} onChange={e => set({ print_date: e.target.value })} /></div>
      <div className="form-group"><label>Transporter</label><input value={draft.angkutan} onChange={e => set({ angkutan: e.target.value })} /></div>
      <div className="form-group"><label>Order Date</label><input type="date" value={draft.order_date || ''} onChange={e => set({ order_date: e.target.value || null })} /></div>
      <div className="form-group"><label>Jadwal Kirim</label><input type="date" value={draft.jadwal_kirim || ''} onChange={e => set({ jadwal_kirim: e.target.value || null })} /></div>
      <div className="form-group"><label>Customer Code</label><input value={draft.customer_code || ''} onChange={e => set({ customer_code: e.target.value })} /></div>
      <div className="form-group"><label>Customer</label><input value={draft.customer || ''} onChange={e => set({ customer: e.target.value })} /></div>
      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Adres</label><input value={draft.adres || ''} onChange={e => set({ adres: e.target.value })} /></div>
      <div className="form-group"><label>Destination</label><input value={draft.destination || ''} onChange={e => set({ destination: e.target.value })} /></div>
      <div className="form-group"><label>Cement Type</label><input value={draft.cement_type || ''} onChange={e => set({ cement_type: e.target.value })} /></div>
      <div className="form-group"><label>Pack</label><input value={draft.pack || ''} onChange={e => set({ pack: e.target.value })} /></div>
      <div className="form-group"><label>Qty</label><input type="number" value={draft.qty ?? ''} onChange={e => set({ qty: e.target.value === '' ? null : Number(e.target.value) })} /></div>
      <div className="form-group"><label>Delv Date</label><input type="date" value={draft.delv_date || ''} onChange={e => set({ delv_date: e.target.value || null })} /></div>
      <div className="form-group"><label>Status Kirim</label><select value={draft.status_kirim} onChange={e => set({ status_kirim: e.target.value as TandaTerima['status_kirim'] })}><option value="belum">Belum</option><option value="tunggu_info">Tunggu Info</option><option value="terkirim">Terkirim</option><option value="batal">Batal</option></select></div>
      <div className="form-group"><label>Status Setoran</label><select value={draft.status_setoran} onChange={e => set({ status_setoran: e.target.value as TandaTerima['status_setoran'] })}><option value="belum">Belum</option><option value="disetor">Disetor</option></select></div>
      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Setoran Note</label><input value={draft.setoran_note || ''} onChange={e => set({ setoran_note: e.target.value })} /></div>
      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Catatan</label><textarea rows={2} value={draft.catatan || ''} onChange={e => set({ catatan: e.target.value })} /></div>
    </div>
  );
}
