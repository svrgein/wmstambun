'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Pin, Send, Trash2, X } from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtDate, fmtTime, getTypeLabel, parseMentions, avatarColor, fmtAgo } from '@/app/lib/helpers';

interface Props {
  w: UseWarehouseReturn;
}

export default function WhiteboardDetailModal({ w }: Props) {
  const cat = w.catatan.find(c => c.id === w.openWhiteboardNoteId) || null;
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const close = () => w.setOpenWhiteboardNoteId(null);
  const comments = cat ? w.commentsByNote[cat.id] || [] : [];
  const canDeleteNote = cat && (w.user?.id === cat.user_id || w.user?.role === 'superadmin');
  const canEditNote = cat && (w.user?.id === cat.user_id || w.user?.role === 'admin' || w.user?.role === 'superadmin');

  useEffect(() => {
    if (cat) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft('');
      const t = setTimeout(() => taRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat?.id]);

  if (!cat) return null;

  const autoGrow = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 130)}px`;
  };

  const submit = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    const ok = await w.addComment(cat.id, draft);
    setSending(false);
    if (ok) setDraft('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const handleDeleteComment = async (comment: (typeof comments)[number]) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    void w.deleteComment(comment);
  };

  const editNote = () => {
    w.openEditCatatan(cat);
    close();
  };

  const mentions = parseMentions(cat.isi);

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="wb-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="wb-modal-strip" style={{ background: cat.warna || 'var(--accent)' }} />

        <div className="wb-modal-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="wb-modal-title">
              {cat.pinned ? <Pin style={{ width: 15, height: 15, marginRight: 4, transform: 'translateY(-1px)' }} /> : null}
              {cat.judul || 'Catatan tanpa judul'}
            </div>
            <div className="wb-modal-meta">
              <span className="wb-badge" style={{ background: cat.warna || 'var(--accent)' }}>{getTypeLabel(cat.warna)}</span>
              <span>oleh {cat.profiles?.nama || 'Unknown'}</span>
              <span>diperbarui {fmtDate(cat.updated_at)} {fmtTime(cat.updated_at)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <MessageCircle style={{ width: 12, height: 12 }} /> {comments.length} komentar
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            {canEditNote && (
              <button className="btn btn-sm btn-ghost" onClick={editNote}>Edit</button>
            )}
            {canDeleteNote && (
              <button className="btn btn-sm btn-danger" onClick={() => { w.deleteCatatan(cat.id); close(); }}>Hapus</button>
            )}
            <button className="wb-modal-close" onClick={close} aria-label="Tutup">
              <X />
            </button>
          </div>
        </div>

        <div className="wb-modal-body">
          <div className="wb-modal-text">{cat.isi || 'Tidak ada isi catatan.'}</div>
          {mentions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {mentions.map(name => <span key={name} className="wb-mention">@{name}</span>)}
            </div>
          )}

          <div className="wb-disc">
            <div className="wb-disc-title">Diskusi ({comments.length})</div>
            {comments.length === 0 ? (
              <div className="wb-nocomment">Belum ada komentar. Mulai diskusi di bawah.</div>
            ) : (
              <div className="wb-comments">
                {comments.map(cm => {
                  const canDelete = w.user?.id === cm.user_id || w.user?.role === 'superadmin';
                  return (
                    <div key={cm.id} className="wb-comment">
                      <div className="wb-avatar" style={{ background: avatarColor(cm.nama) }}>
                        {(cm.nama || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="wb-cmain">
                        <div className="wb-cmeta">
                          <span className="wb-cname">{cm.nama}</span>
                          <span className="wb-cdate" title={`${fmtDate(cm.created_at)} ${fmtTime(cm.created_at)}`}>
                            {fmtAgo(cm.created_at)}
                          </span>
                        </div>
                        <div className="wb-ctext">{cm.isi}</div>
                      </div>
                      {canDelete && (
                        <button className="wb-cdel" title="Hapus komentar" aria-label="Hapus komentar" onClick={() => void handleDeleteComment(cm)}>
                          <Trash2 />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="wb-compose">
          <div className="wb-compose-row">
            <textarea
              ref={taRef}
              rows={1}
              placeholder="Tulis komentar… (Enter untuk kirim, Shift+Enter baris baru)"
              value={draft}
              onChange={e => { setDraft(e.target.value); autoGrow(); }}
              onKeyDown={onKeyDown}
            />
            <button className="wb-send" onClick={() => void submit()} disabled={!draft.trim() || sending}>
              {sending ? '…' : <><Send style={{ width: 14, height: 14 }} /> Kirim</>}
            </button>
          </div>
          <div className="wb-mention-hint">Gunakan @nama untuk mention seseorang.</div>
        </div>
      </div>
    </div>
  );
}
