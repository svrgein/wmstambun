'use client';

import React, { useState } from 'react';
import { MessageCircle, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import {
  parseMentions, whiteboardTypes, getTypeLabel, avatarColor, fmtAgo,
} from '@/app/lib/helpers';

interface Props { w: UseWarehouseReturn; }

export default function WhiteboardPage({ w }: Props) {
  const [selectedType, setSelectedType] = useState('Semua');

  const canManage = (userId: string | undefined) =>
    userId === w.user?.id || w.user?.role === 'admin' || w.user?.role === 'superadmin';
  const canDelete = (userId: string | undefined) =>
    userId === w.user?.id || w.user?.role === 'superadmin';

  const filteredNotes = selectedType === 'Semua'
    ? w.catatan
    : w.catatan.filter(c => getTypeLabel(c.warna) === selectedType);

  const openNote = (id: string) => w.setOpenWhiteboardNoteId(id);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Whiteboard & Catatan</div>
          <div className="section-subtitle">
            {w.unreadWhiteboardCount > 0
              ? `🔔 ${w.unreadWhiteboardCount} notifikasi baru belum dibaca`
              : 'Klik kartu untuk membaca & ikut diskusi.'}
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

      {filteredNotes.length === 0 ? (
        <div className="wb-empty">
          Belum ada catatan untuk kategori ini.{' '}
          <button className="btn btn-primary btn-sm" onClick={() => w.setModalCatatan(true)}>Buat catatan sekarang</button>
        </div>
      ) : (
        <div className="wb-masonry">
          {filteredNotes.map(c => {
            const comments = w.commentsByNote[c.id] || [];
            const mentions = parseMentions(c.isi);
            const lastComment = comments[comments.length - 1];
            const authorName = c.profiles?.nama || 'Unknown';
            return (
              <div
                key={c.id}
                className="wb-card"
                role="button"
                tabIndex={0}
                aria-label={`Buka catatan ${c.judul || 'tanpa judul'}`}
                onClick={() => openNote(c.id)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNote(c.id); } }}
              >
                <div className="wb-strip" style={{ background: c.warna || 'var(--accent)' }} />

                <div className="wb-body-pad">
                  <div className="wb-head">
                    <div className="wb-title">
                      {c.pinned && <Pin style={{ width: 13, height: 13, marginRight: 4, transform: 'translateY(-1px)' }} />}
                      {c.judul || 'Catatan tanpa judul'}
                    </div>
                    {canManage(c.user_id) && (
                      <div className="wb-actions" onClick={e => e.stopPropagation()}>
                        <button className="wb-act" title={c.pinned ? 'Lepas pin' : 'Pin catatan'} onClick={() => void w.togglePinCatatan(c)}>
                          {c.pinned ? <PinOff /> : <Pin />}
                        </button>
                        <button className="wb-act" title="Edit" onClick={() => w.openEditCatatan(c)}>
                          <Pencil />
                        </button>
                        {canDelete(c.user_id) && (
                          <button className="wb-act danger" title="Hapus" onClick={() => void w.deleteCatatan(c.id)}>
                            <Trash2 />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="wb-tags">
                    <span className="wb-badge" style={{ background: c.warna || 'var(--accent)' }}>{getTypeLabel(c.warna)}</span>
                    {mentions.slice(0, 3).map(name => (
                      <span key={name} className="wb-mention">@{name}</span>
                    ))}
                    {mentions.length > 3 && <span className="wb-mention">+{mentions.length - 3}</span>}
                  </div>

                  <div className="wb-body">{c.isi || 'Tidak ada isi catatan.'}</div>

                  {lastComment && (
                    <div className="wb-lastcomment">
                      <b>{lastComment.nama}</b>
                      <span>{lastComment.isi}</span>
                    </div>
                  )}

                  <div className="wb-foot">
                    <div className="wb-author">
                      <span className="wb-avatar" style={{ background: avatarColor(authorName) }}>{authorName.charAt(0).toUpperCase()}</span>
                      <span className="wb-author-name">{authorName}</span>
                    </div>
                    <div className="wb-right">
                      <span className="wb-time" title={c.updated_at}>{fmtAgo(c.updated_at)}</span>
                      <span className={`wb-comcount${comments.length > 0 ? ' has' : ''}`}>
                        <MessageCircle /> {comments.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
