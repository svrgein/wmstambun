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
  const [commentsByNote, setCommentsByNote] = useState<Record<string, Array<{ id: string; nama: string; isi: string; created_at: string; user_id?: string | null }>>>({});
  const currentUserName = w.user?.nama?.trim() || '';

  const loadComments = async () => {
    if (!w.user?.id) return;

    try {
      const { data, error } = await w.supabase
        .from('catatan_komentar')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const groupedComments = (data || []).reduce<Record<string, Array<{ id: string; nama: string; isi: string; created_at: string; user_id?: string | null }>>>((acc, comment) => {
        const catatanId = comment.catatan_id;
        if (!catatanId) return acc;

        acc[catatanId] = [
          ...(acc[catatanId] || []),
          {
            id: comment.id,
            nama: comment.nama || 'Guest',
            isi: comment.isi || '',
            created_at: comment.created_at || new Date().toISOString(),
            user_id: comment.user_id || null,
          },
        ];
        return acc;
      }, {});

      setCommentsByNote(groupedComments);
      window.localStorage.setItem('whiteboard-comments', JSON.stringify(groupedComments));
    } catch (error) {
      console.error('Gagal memuat komentar whiteboard:', error);
      const storedComments = window.localStorage.getItem('whiteboard-comments');
      if (storedComments) {
        try {
          setCommentsByNote(JSON.parse(storedComments));
        } catch {
          setCommentsByNote({});
        }
      }
    }
  };

  useEffect(() => {
    const storedComments = window.localStorage.getItem('whiteboard-comments');
    if (storedComments) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCommentsByNote(JSON.parse(storedComments));
      } catch {
        setCommentsByNote({});
      }
    }
  }, []);

  useEffect(() => {
    if (!w.user?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.user?.id, w.catatan.length]);

  useEffect(() => {
    window.localStorage.setItem('whiteboard-comments', JSON.stringify(commentsByNote));
  }, [commentsByNote]);
  const notifications = useMemo(() => {
    const mentionNotifications = w.catatan.flatMap(c => parseMentions(c.isi).includes(currentUserName)
      ? [{ id: `note-${c.id}`, catatan_id: c.id, message: `Anda disebut di catatan "${c.judul}"`, created_at: c.updated_at }]
      : []);

    const commentMentionNotifications = Object.entries(commentsByNote).flatMap(([catatanId, comments]) =>
      comments.filter(comment => comment.nama !== currentUserName && parseMentions(comment.isi).includes(currentUserName)).map(comment => ({
        id: comment.id,
        catatan_id: catatanId,
        message: `Anda disebut di komentar pada catatan`,
        created_at: comment.created_at,
      }))
    );

    return [...w.whiteboardNotifications, ...mentionNotifications, ...commentMentionNotifications];
  }, [currentUserName, commentsByNote, w.catatan, w.whiteboardNotifications]);

  const makeComment = async (catatanId: string) => {
    const isi = commentDrafts[catatanId]?.trim();
    if (!isi || !w.user?.id) return;

    const nextComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nama: currentUserName || 'Guest',
      isi,
      created_at: new Date().toISOString(),
      user_id: w.user.id,
    };

    try {
      const { data, error } = await w.supabase.from('catatan_komentar').insert({
        catatan_id: catatanId,
        user_id: w.user.id,
        nama: nextComment.nama,
        isi: nextComment.isi,
        created_at: nextComment.created_at,
      }).select().single();

      if (error) throw error;

      const savedComment = {
        id: data.id,
        nama: data.nama || nextComment.nama,
        isi: data.isi || nextComment.isi,
        created_at: data.created_at || nextComment.created_at,
        user_id: data.user_id || nextComment.user_id,
      };

      setCommentsByNote(prev => ({
        ...prev,
        [catatanId]: [...(prev[catatanId] || []), savedComment],
      }));
      setCommentDrafts(prev => ({ ...prev, [catatanId]: '' }));

      const note = w.catatan.find(item => item.id === catatanId);
      const noteOwner = note?.user_id;
      const isDifferentAuthor = noteOwner && noteOwner !== w.user?.id;

      if (isDifferentAuthor) {
        w.addWhiteboardNotification({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          catatan_id: catatanId,
          message: `Komentar baru pada catatan "${note?.judul || 'tanpa judul'}"`,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Gagal menyimpan komentar whiteboard:', error);
      w.triggerToast('Komentar gagal disimpan. Periksa kebijakan RLS tabel komentar.', 'error');
    }
  };

  const handleCommentKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>, catatanId: string) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      makeComment(catatanId);
    }
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
          <div className="section-subtitle">
            {notifications.length > 0 ? `Notifikasi: ${notifications.length}` : 'Selalu update dan Catet di sini.'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => w.setModalCatatan(true)}>+ Catatan Baru</button>
      </div>

      <div className="note-filters">
        {whiteboardTypes.map(type => (
          <button
            key={type.label}
            className={`btn btn-ghost btn-sm filter-pill${selectedType === type.label ? ' active' : ''}`}
            style={{ borderColor: selectedType === type.label ? type.color : 'transparent', color: selectedType === type.label ? type.color : 'var(--muted)' }}
            onClick={() => setSelectedType(type.label)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="note-grid">
        {filteredNotes.map(c => {
          const mentions = parseMentions(c.isi);
          const comments = commentsByNote[c.id] || [];
          return (
            <div key={c.id} className="note-card" style={{ boxShadow: '0 16px 32px rgba(0,0,0,0.08)' }}>
              <div className="note-card-strip" style={{ background: c.warna || 'var(--accent)' }} />
              <div className="note-card-content">
                <div className="note-card-header">
                  <div>
                    <div className="note-card-title">{c.pinned && '📌 '}{c.judul || 'Catatan tanpa judul'}</div>
                    <div className="note-card-tags">
                      <span className="note-badge" style={{ background: c.warna || '#e8a045', color: '#fff' }}>
                        {getTypeLabel(c)}
                      </span>
                      {mentions.map(name => (
                        <span key={name} className="note-tag">@{name}</span>
                      ))}
                    </div>
                  </div>
                  {(w.user?.id === c.user_id || w.user?.role === 'admin' || w.user?.role === 'superadmin') && (
                    <div className="note-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => w.togglePinCatatan(c)}>{c.pinned ? 'Unpin' : 'Pin'}</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => w.openEditCatatan(c)}>Edit</button>
                      {(w.user?.id === c.user_id || w.user?.role === 'superadmin') && (
                        <button className="btn btn-sm btn-danger" onClick={() => w.deleteCatatan(c.id)}>Hapus</button>
                      )}
                    </div>
                  )}
                </div>

                <div className="note-card-body">{c.isi || 'Tidak ada isi catatan.'}</div>

                <div className="note-meta">
                  <span>{c.profiles?.nama || 'Unknown'}</span>
                  <span>{fmtDate(c.updated_at)} {fmtTime(c.updated_at)}</span>
                </div>

                {comments.length > 0 && (
                  <div className="note-comments">
                    {comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-author">{comment.nama}</div>
                        <div className="comment-body">{comment.isi}</div>
                        <div className="comment-meta">{fmtDate(comment.created_at)} {fmtTime(comment.created_at)}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="note-comment-input">
                  <textarea
                    value={commentDrafts[c.id] || ''}
                    onChange={e => setCommentDrafts(prev => ({ ...prev, [c.id]: e.target.value }))}
                    onKeyDown={e => handleCommentKeyDown(e, c.id)}
                    placeholder="Tambah komentar"
                    className="comment-input"
                    rows={1}
                    style={{ minHeight: '38px', maxHeight: '80px' }}
                  />
                  <button className="btn btn-sm btn-primary" onClick={() => makeComment(c.id)}>Kirim</button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="note-empty-state">Belum ada catatan untuk kategori ini.</div>
        )}
      </div>
    </div>
  );
}
