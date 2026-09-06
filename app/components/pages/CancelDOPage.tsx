'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtDate, today } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

interface CancelDOManual {
  id: string;
  tanggal: string;
  kode_toko: string | null;
  toko: string | null;
  tanggal_do: string | null;
  sdo: string;
  created_at: string;
}

interface ParsedCancelDO {
  kode_toko: string;  
  toko: string;
  tanggal_do: string | null;
  sdo: string;
}

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

const parseDODate = (value: string, archiveDate: string) => {
  const match = value.trim().match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const fallbackYear = archiveDate.slice(0, 4);
  const fullYear = year ? (year.length === 2 ? `20${year}` : year) : fallbackYear;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const parseCancelDO = (value: string, archiveDate: string): ParsedCancelDO[] => {
  let kodeToko = '';
  let toko = '';
  let tanggalDO: string | null = null;
  const records: ParsedCancelDO[] = [];

  value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
    const tokoMatch = line.match(/^(\d+)\s*-\s*(.+)$/i);
    if (tokoMatch) {
      kodeToko = tokoMatch[1];
      toko = tokoMatch[2].trim();
      return;
    }

    const doMatch = line.match(/^do\s+(.+)$/i);
    if (doMatch) {
      tanggalDO = parseDODate(doMatch[1], archiveDate);
      return;
    }

    const sdoMatch = line.match(/^sdo\s+(.+)$/i);
    if (sdoMatch && kodeToko && toko) {
      records.push({ kode_toko: kodeToko, toko, tanggal_do: tanggalDO, sdo: sdoMatch[1].trim() });
    }
  });

  return records;
};

export default function CancelDOPage({ w }: Props) {
  const [selectedDate, setSelectedDate] = useState(today());
  const [pasteValue, setPasteValue] = useState('');
  const [records, setRecords] = useState<CancelDOManual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadRecords = async () => {
    setIsLoading(true);
    const { data, error } = await w.supabase.from('cancel_do_manual').select('*').eq('tanggal', selectedDate).order('created_at', { ascending: false });
    if (error) {
      w.triggerToast(error.code === '42P01' ? 'Tabel List Cancel DO belum dibuat. Jalankan file SQL yang disediakan.' : error.message, 'error');
      setRecords([]);
    } else {
      setRecords(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const parsedRows = useMemo(() => parseCancelDO(pasteValue, selectedDate), [pasteValue, selectedDate]);

  const savePaste = async () => {
    if (parsedRows.length === 0) {
      w.triggerToast('Format belum terbaca. Pastikan ada kode toko, baris DO, dan minimal satu SDO.', 'error');
      return;
    }
    setIsSaving(true);
    const { error } = await w.supabase.from('cancel_do_manual').upsert(parsedRows.map((row) => ({
      ...row,
      tanggal: selectedDate,
      raw_data: pasteValue,
      created_by: w.user?.id,
    })), { onConflict: 'tanggal,sdo' });
    setIsSaving(false);

    if (error) {
      w.triggerToast(error.code === '42P01' ? 'Tabel List Cancel DO belum dibuat. Jalankan file SQL yang disediakan.' : error.message, 'error');
      return;
    }
    setPasteValue('');
    w.triggerToast(`${parsedRows.length} SDO cancel tersimpan untuk ${fmtDate(selectedDate)}.`);
    await loadRecords();
  };

  return (
    <div>
      <div className="section-header">
        <div><div className="section-title">List Cancel DO ({records.length})</div><div className="section-subtitle">Arsip cancel DO berdasarkan tanggal input.</div></div>
        <div className="flex-row">
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDate(today())}>Hari Ini</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDate(getYesterday())}>Kemarin</button>
          <input aria-label="Tanggal list cancel DO" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} style={{ width: '150px' }} />
        </div>
      </div>

      <div className="card mb-20">
        <div className="card-title">SESUAI FORMAT YE — {fmtDate(selectedDate)}</div>
        <div className="text-muted text-sm mb-12">Gunakan format: kode toko - nama toko, lalu “do tanggal”, lalu satu atau beberapa “sdo nomor”.</div>
        <textarea value={pasteValue} onChange={(event) => setPasteValue(event.target.value)} placeholder={'011632 - TK.BERKAH JAYA\ndo 14/7\nsdo 0213025504\nsdo 0213025505'} style={{ minHeight: '150px', marginBottom: '10px' }} />
        <div className="flex-between"><span className="text-muted text-sm">{parsedRows.length} SDO siap disimpan</span><button className="btn btn-primary" onClick={() => void savePaste()} disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan List Cancel DO'}</button></div>
      </div>

      <div className="table-wrap"><table>
        <thead><tr><th>Kode Toko</th><th>Toko</th><th>Tgl DO</th><th>SDO</th><th>Waktu Simpan</th></tr></thead>
        <tbody>
          {records.map((record) => <tr key={record.id}><td className="font-bold">{record.kode_toko || '—'}</td><td>{record.toko || '—'}</td><td>{record.tanggal_do ? fmtDate(record.tanggal_do) : '—'}</td><td className="font-bold text-accent" style={{ fontFamily: 'monospace' }}>{record.sdo}</td><td>{new Date(record.created_at).toLocaleString('id-ID')}</td></tr>)}
          {!isLoading && records.length === 0 && <tr className="empty-row"><td colSpan={5}>Belum ada cancel DO pada tanggal ini.</td></tr>}
          {isLoading && <tr className="empty-row"><td colSpan={5}>Memuat data...</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
}
