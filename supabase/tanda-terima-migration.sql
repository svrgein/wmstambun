-- ─────────────────────────────────────────────────────────────────────────────
-- DLI TAMBUN WMS — MIGRASI Tanda Terima DO
-- JALANKAN INI kalau lo udah pernah jalan tanda-terima.sql VERSI LAMA
-- (yg belum punya kolom cek_angkutan & status_kirim belum izinin 'batal').
-- Ini nge-fix tabel yg udah ada biar CRUD (pindah angkutan, batal DO, dll) jalan.
-- Aman dijalankan berulang (idempoten).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Tambah kolom cek_angkutan kalau belum ada (default 'belum').
alter table public.tanda_terima
  add column if not exists cek_angkutan text not null default 'belum';

-- pastiin constraint-nya ada (drop+add biar value valid sesuai).
alter table public.tanda_terima drop constraint if exists tanda_terima_cek_angkutan_check;
alter table public.tanda_terima
  add constraint tanda_terima_cek_angkutan_check check (cek_angkutan in ('belum','sudah'));

-- 2) Izinin status_kirim = 'batal' (drop check lama, add check baru).
alter table public.tanda_terima drop constraint if exists tanda_terima_status_kirim_check;
alter table public.tanda_terima
  add constraint tanda_terima_status_kirim_check
  check (status_kirim in ('belum','tunggu_info','terkirim','batal'));

-- 3) Backfill: pastiin cek_angkutan ke-default 'belum' utk baris lama.
update public.tanda_terima set cek_angkutan = 'belum' where cek_angkutan is null;

-- 4) Index cek_angkutan (utk chip "Perlu Dicek").
create index if not exists tanda_terima_cek_idx on public.tanda_terima (cek_angkutan);

-- Selesai. Refresh halaman Tanda Terima DO — pindah angkutan & batal DO harus jalan sekarang.
