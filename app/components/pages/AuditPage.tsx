'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtDate, fmtTime } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function AuditPage({ w }: Props) {
  return (
    <div>
      <div className="section-header">
        <div className="section-title">Audit Log ({w.auditLogs.length} entri terakhir)</div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Waktu</th><th>Tabel</th><th>Aksi</th><th>Ringkasan</th><th>Pengguna</th></tr></thead>
          <tbody>
            {w.auditLogs.map(log => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '12px' }}>{fmtDate(log.created_at)} {fmtTime(log.created_at)}</td>
                <td><span className="badge b-blue">{log.tabel}</span></td>
                <td><span className={`badge ${log.aksi === 'INSERT' ? 'b-masuk' : log.aksi === 'DELETE' ? 'b-keluar' : 'b-warn'}`}>{log.aksi}</span></td>
                <td style={{ maxWidth: '320px', fontSize: '12.5px' }}>{log.ringkasan}</td>
                <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{log.profiles?.nama || '—'}</td>
              </tr>
            ))}
            {w.auditLogs.length === 0 && <tr className="empty-row"><td colSpan={5}>Belum ada log.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
