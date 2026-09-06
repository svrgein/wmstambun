-- ─────────────────────────────────────────────────────────────────────────────
-- DLI TAMBUN WMS — Whiteboard: Realtime & Hapus Komentar
-- Jalankan SKRIP INI SEKALI di Supabase Dashboard > SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) AKTIFKAN REALTIME untuk tabel catatan & komentar.
--    Tanpa ini, fitur update/notifikasi otomatis tidak akan berjalan
--    (tidak error, hanya diam).
alter publication supabase_realtime add table public.catatan;
alter publication supabase_realtime add table public.catatan_komentar;

-- 2) RLS: pengguna boleh menghapus komentar miliknya sendiri.
drop policy if exists "delete own comment" on public.catatan_komentar;
create policy "delete own comment" on public.catatan_komentar
  for delete using (auth.uid() = user_id);

-- 3) RLS: superadmin boleh menghapus komentar siapa pun.
--    Asumsi: role pengguna tersimpan di kolom public.profiles.role.
drop policy if exists "superadmin delete comment" on public.catatan_komentar;
create policy "superadmin delete comment" on public.catatan_komentar
  for delete using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

-- CATATAN:
-- * Policy #2 dan #3 bersifat OR (Supabase otomatis menggabungkannya).
-- * Pastikan tabel catatan_komentar sudah punya policy SELECT & INSERT
--   untuk authenticated (biasanya sudah, karena fitur komentar berjalan).
-- * Jika kolom role tidak ada di tabel profiles, sesuaikan query #3
--   dengan struktur tabel Anda.
