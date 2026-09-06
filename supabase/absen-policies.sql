-- ─────────────────────────────────────────────────────────────────────────────
-- DLI TAMBUN WMS — Absen Angkutan Harian & Pallet Detail
-- Jalankan SKRIP INI SEKALI di Supabase Dashboard > SQL Editor (sebelum fitur dipakai).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Tabel absen harian (satu baris per supir per tanggal).
--    - Supir tetap (jenis = 'reguler') menunjuk ke tabel angkutan lewat angkutan_id.
--    - Supir bantuan (jenis = 'bantuan') dicatat dadakan tanpa harus masuk master.
--    Nama/kendaraan DISALIN ke kolom snapshot supaya riwayat tidak berubah
--    walaupun data master diedit/dihapus belakangan.
create table if not exists public.absen_harian (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null,
  angkutan_id uuid null references public.angkutan(id) on delete set null,
  jenis text not null default 'reguler' check (jenis in ('reguler','bantuan')),
  nama_sopir text not null default '',
  nama_angkutan text not null default '',
  no_polisi text null,
  kapasitas_zak int null,
  gudang_asal text null,
  status text not null default 'hadir' check (status in ('hadir','tidak')),
  jumlah_pallet int null,
  asal_pallet text null check (asal_pallet in ('gudang_kita','gudang_lain','tidak_ada') or asal_pallet is null),
  catatan text null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists absen_harian_tanggal_idx on public.absen_harian (tanggal);
create index if not exists absen_harian_angkutan_idx on public.absen_harian (angkutan_id);

-- 2) Catatan harian (satu note per tanggal).
create table if not exists public.absen_catatan_harian (
  tanggal date primary key,
  isi text not null default '',
  updated_by uuid null,
  updated_at timestamptz not null default now()
);

-- 3) RLS: seluruh data absen dibaca oleh semua user yang login,
--    dan diubah oleh admin/superadmin (atau user yang bersangkutan tidak perlu).
alter table public.absen_harian enable row level security;
alter table public.absen_catatan_harian enable row level security;

drop policy if exists "absen_harian select" on public.absen_harian;
create policy "absen_harian select" on public.absen_harian
  for select using (auth.role() = 'authenticated');

drop policy if exists "absen_harian insert admin" on public.absen_harian;
create policy "absen_harian insert admin" on public.absen_harian
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

drop policy if exists "absen_harian update admin" on public.absen_harian;
create policy "absen_harian update admin" on public.absen_harian
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

drop policy if exists "absen_harian delete admin" on public.absen_harian;
create policy "absen_harian delete admin" on public.absen_harian
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

drop policy if exists "absen_catatan_harian select" on public.absen_catatan_harian;
create policy "absen_catatan_harian select" on public.absen_catatan_harian
  for select using (auth.role() = 'authenticated');

drop policy if exists "absen_catatan_harian upsert admin" on public.absen_catatan_harian;
create policy "absen_catatan_harian upsert admin" on public.absen_catatan_harian
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );
create policy "absen_catatan_harian update admin" on public.absen_catatan_harian
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

-- CATATAN:
-- * Akses baca untuk semua user login; tulis/hapus khusus admin & superadmin.
--   Kalau mau operator biasa ikut mengisi, ubah p.role in (...) sesuai kebutuhan.
-- * Asumsi tabel public.profiles punya kolom role. Sesuaikan bila beda.
