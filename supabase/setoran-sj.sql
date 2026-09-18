-- ─────────────────────────────────────────────────────────────────────────────
-- DLI TAMBUN WMS — Buku Setoran Surat Jalan (manual per SJ)
-- Jalankan SKRIP INI SEKALI di Supabase Dashboard > SQL Editor (sebelum fitur dipakai).
--
-- PENTING: Kalau versi tabel ini SEBELUMNYA pernah dibuat (model lama berbasis DO),
-- hapus dulu tabel lamanya (aman, belum ada data penting), lalu jalankan skrip ini:
--   drop table if exists public.setoran_sj;
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Ledger manual: satu baris = satu surat jalan yang kamu catat sendiri
--    (bebas, tidak diambil dari data DO / pengiriman bertahap).
--    * status 'belum'   → SJ masih ditunggu/disetor, catat alasannya.
--    * status 'disetor' → SJ sudah diserahkan, disetor_tanggal terisi.
--    * tanggal         → tanggal surat/kirim (OPSIONAL, buat deteksi telat).
create table if not exists public.setoran_sj (
  id uuid primary key default gen_random_uuid(),
  no_sj text not null,
  angkutan text not null default '',
  toko text not null default '',
  tanggal date null,
  status text not null default 'belum' check (status in ('belum','disetor')),
  alasan text null,
  catatan text null,
  disetor_tanggal date null,
  disetor_oleh uuid null references public.profiles(id) on delete set null,
  dibuat_oleh uuid null references public.profiles(id) on delete set null,
  updated_oleh uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists setoran_sj_status_idx on public.setoran_sj (status);
create index if not exists setoran_sj_tanggal_idx on public.setoran_sj (tanggal desc);
create index if not exists setoran_sj_created_idx on public.setoran_sj (created_at desc);

-- 2) RLS: baca semua user login; tulis/hapus khusus admin & superadmin.
alter table public.setoran_sj enable row level security;

drop policy if exists "setoran_sj select" on public.setoran_sj;
create policy "setoran_sj select" on public.setoran_sj
  for select using (auth.role() = 'authenticated');

drop policy if exists "setoran_sj insert admin" on public.setoran_sj;
create policy "setoran_sj insert admin" on public.setoran_sj
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

drop policy if exists "setoran_sj update admin" on public.setoran_sj;
create policy "setoran_sj update admin" on public.setoran_sj
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

drop policy if exists "setoran_sj delete admin" on public.setoran_sj;
create policy "setoran_sj delete admin" on public.setoran_sj
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

-- CATATAN:
-- * Baca untuk semua user login; tulis/hapus admin & superadmin.
--   Kalau mau operator ikut mengisi, ubah p.role in (...) pada kebijakan di atas.
