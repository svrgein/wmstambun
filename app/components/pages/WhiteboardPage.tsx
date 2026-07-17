'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtDate, fmtTime } from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

const whiteboardTypes = [
  { label: 'Semua', color: 'var(--surface)' },
  { label: 'DO', color: '#e05252' },
  { label: 'Angkutan', color: '#5b8af5' },
  { label: 'Operasional', color: '#e8a045' },
  { label: 'Barang', color: '#4caf7d' },
  { label: 'Lainnya', color: '#a259f7' },
];

const typeLabelByColor: Record<string, string> = {
  '#e05252': 'DO',
  '#5b8af5': 'Angkutan',
  '#e8a045': 'Operasional',
  '#4caf7d': 'Barang',
  '#a259f7': 'Lainnya',
};

const parseMentions = (text: string) => {
  return Array.from(new Set((text.match(/@[A-Za-z0-9_\-]+/g) || []).map(tag => tag.slice(1))));
};

export default function WhiteboardPage({ w }: Props) {
  const [selectedType, setSelectedType] = useState('Semua');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentsByNote, setCommentsByNote] = useState<Record<string, Array<{ id: string; nama: string; isi: string; created_at: string }>>>({});

  useEffect(() => {
    const storedComments = window.localStorage.getItem('whiteboard-comments');
    if (storedComments) setCommentsByNote(JSON.parse(storedComments));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('whiteboard-comments', JSON.stringify(commentsByNote));
  }, [commentsByNote]);

  const currentUserName = w.user?.nama?.trim() || '';
  const notifications = useMemo(() => {
    const noteMentions = w.catatan.flatMap(c => parseMentions(c.isi).includes(currentUserName)
      ? [{ id: `note-${c.id}`, catatan_id: c.id, message: `Anda disebut di catatan "${c.judul}"`, created_at: c.updated_at }]
      : []);

    const commentMentions = Object.entries(commentsByNote).flatMap(([catatanId, comments]) =>
      comments.filter(comment => comment.nama !== currentUserName && parseMentions(comment.isi).includes(currentUserName)).map(comment => ({
        id: comment.id,
        catatan_id: catatanId,
        message: `Anda disebut di komentar pada catatan`,
        created_at: comment.created_at,
      }))
    );

    return [...noteMentions, ...commentMentions];
  }, [currentUserName, commentsByNote, w.catatan]);

  const makeComment = (catatanId: string) => {
    const isi = commentDrafts[catatanId]?.trim();
    if (!isi) return;
    const nextComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nama: currentUserName || 'Guest',
      isi,
      created_at: new Date().toISOString(),
    };
    setCommentsByNote(prev => ({
      ...prev,
      [catatanId]: [...(prev[catatanId] || []), nextComment],
    }));
    setCommentDrafts(prev => ({ ...prev, [catatanId]: '' }));
  };

  const getTypeLabel = (c: { warna: string }) => typeLabelByColor[c.warna] || 'Lainnya';
  const filteredNotes = selectedType === 'Semua'
    ? w.catatan
    : w.catatan.filter(c => getTypeLabel(c) === selectedType);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Whiteboard & Catatan</div>
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            {notifications.length > 0 ? `Notifikasi: ${notifications.length} sebutan` : 'Tidak ada notifikasi sebutan.'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => w.setModalCatatan(true)}>+ Catatan Baru</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {whiteboardTypes.map(type => (
          <button
            key={type.label}
            className={`btn btn-ghost btn-sm${selectedType === type.label ? ' active' : ''}`}
            style={{ borderColor: selectedType === type.label ? type.color : 'transparent', color: type.color }}
            onClick={() => setSelectedType(type.label)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredNotes.map(c => {
          const mentions = parseMentions(c.isi);
          const comments = commentsByNote[c.id] || [];
          return (
            <div key={c.id} style={{ background: c.warna || 'var(--surface)', border: `1px solid ${c.warna ? 'transparent' : 'var(--border)'}`, borderRadius: '12px', padding: '18px', color: '#000', position: 'relative' }}>
              <div className="flex-between mb-12">
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{c.pinned && '📌 '}{c.judul}</div>
                  <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 700 }}>{getTypeLabel(c)}</span>
                    {mentions.map(name => (
                      <span key={name} style={{ padding: '4px 8px', borderRadius: '999px', background: 'rgba(0,0,0,0.07)', fontSize: '11px' }}>@{name}</span>
                    ))}
                  </div>
                </div>
                {(w.user?.id === c.user_id || w.user?.role === 'superadmin') && (
                  <button className="btn btn-sm btn-outline" onClick={() => w.openEditCatatan(c)}>Edit</button>
                )}
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: '14px', opacity: 0.95 }}>{c.isi}</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ fontSize: '11px', opacity: 0.8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{c.profiles?.nama || 'Unknown'}</span>
                  <span>{fmtDate(c.updated_at)} {fmtTime(c.updated_at)}</span>
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {comments.map(comment => (
                    <div key={comment.id} style={{ background: 'rgba(255,255,255,0.65)', borderRadius: '10px', padding: '10px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>{comment.nama}</div>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{comment.isi}</div>
                      <div style={{ marginTop: '6px', fontSize: '11px', opacity: 0.75 }}>{fmtDate(comment.created_at)} {fmtTime(comment.created_at)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                  <input
                    value={commentDrafts[c.id] || ''}
                    onChange={e => setCommentDrafts(prev => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="Tambah komentar... gunakan @nama untuk tag"
                    style={{ flex: 1, minWidth: 0, height: '38px', borderRadius: '10px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '13px' }}
                  />
                  <button className="btn btn-sm btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => makeComment(c.id)}>Kirim</button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredNotes.length === 0 && <div className="text-muted">Belum ada catatan untuk kategori ini.</div>}
      </div>
    </div>
  );
}
