'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtDate, fmtTime } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function WhiteboardPage({ w }: Props) {
  return (
    <div>
      <div className="section-header">
        <div className="section-title">Whiteboard & Catatan</div>
        <button className="btn btn-primary" onClick={() => w.setModalCatatan(true)}>+ Catatan Baru</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {w.catatan.map(c => (
          <div key={c.id} style={{ background: c.warna || 'var(--surface)', border: `1px solid ${c.warna ? 'transparent' : 'var(--border)'}`, borderRadius: '12px', padding: '18px', color: '#000', position: 'relative' }}>
            <div className="flex-between mb-12">
              <div style={{ fontWeight: 800, fontSize: '15px' }}>{c.pinned && '📌 '}{c.judul}</div>
              <div className="flex-row gap-12" style={{ opacity: 0.6 }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }} onClick={() => w.openEditCatatan(c)}>✏️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }} onClick={() => w.togglePinCatatan(c)}>{c.pinned ? '📍' : '📌'}</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }} onClick={() => w.deleteCatatan(c.id)}>✕</button>
              </div>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: '14px', opacity: 0.9 }}>{c.isi}</div>
            <div className="flex-between" style={{ fontSize: '11px', opacity: 0.7, fontWeight: 600 }}>
              <div>{c.profiles?.nama || 'Unknown'}</div>
              <div>{fmtDate(c.updated_at)} {fmtTime(c.updated_at)}</div>
            </div>
          </div>
        ))}
        {w.catatan.length === 0 && <div className="text-muted">Belum ada catatan.</div>}
      </div>
    </div>
  );
}
