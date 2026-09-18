-- ─────────────────────────────────────────────────────────────────────────────
-- DLI TAMBUN WMS — Buku Tanda Terima DO (berbasis paste, per angkutan)
-- Jalankan SKRIP INI SEKALI di Supabase Dashboard > SQL Editor (sebelum fitur dipakai).
--
-- Konsep: satu baris = satu SDO yang dipaste dari aplikasi DO eksternal,
-- lengkap dengan field dari app itu (order date, jadwal kirim, customer code,
-- customer, adres, destination, cement type, pack, qty) + tracking yang diisi
-- di app (status kirim, delv date, status setoran, setoran note).
--   * status_kirim   'belum' | 'tunggu_info' | 'terkirim'
--   * status_setoran 'belum' | 'disetor'
-- Unique(sdo) agar re-paste upsert-by-sdo (preserve tracking, update field paste).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.tanda_terima (
  id uuid primary key default gen_random_uuid(),
  print_date date not null,                 -- tanggal print (yg user pilih)
  angkutan text not null default '',        -- nama transporter (cth INTITRANS/GMS)
  -- kolom dari paste (app eksternal):
  order_date date null,                      -- tanggal DO dibuat
  sdo text not null,                         -- SDO / no DO (KEY)
  jadwal_kirim date null,                    -- jadwal kirim DO
  customer_code text null,
  customer text null,                        -- nama toko
  adres text null,                           -- alamat lengkap
  destination text null,                     -- area (cth TARUMAJAYA)
  cement_type text null,                     -- jenis semen (cth PCC)
  pack text null,                            -- berat/zak (cth 50 KG)
  qty numeric null,                          -- jumlah zak
  -- tracking (input di app):
  status_kirim text not null default 'belum'
    check (status_kirim in ('belum','tunggu_info','terkirim','batal')),
  alasan_tunggu text null,
  delv_date date null,                       -- tanggal kirim aktual
  status_setoran text not null default 'belum'
    check (status_setoran in ('belum','disetor')),
  setoran_note text null,                     -- cth "SURAT JALAN SUDAH DI SETOR KE GUDANG"
  cek_angkutan text not null default 'belum' check (cek_angkutan in ('belum','sudah')),
  catatan text null,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sdo)
);
create index if not exists tanda_terima_print_idx on public.tanda_terima (print_date desc);
create index if not exists tanda_terima_angkutan_idx on public.tanda_terima (angkutan);
create index if not exists tanda_terima_kirim_idx on public.tanda_terima (status_kirim);
create index if not exists tanda_terima_setoran_idx on public.tanda_terima (status_setoran);

-- ── MIGRASI (idempoten): fix tabel lama yg belum punya cek_angkutan / belum izinin 'batal' ──
-- Kalau tabel udah dibuat dari versi lama, blok ini nge-fix-nya. Aman dijalankan berulang.
alter table public.tanda_terima
  add column if not exists cek_angkutan text not null default 'belum';
alter table public.tanda_terima drop constraint if exists tanda_terima_cek_angkutan_check;
alter table public.tanda_terima
  add constraint tanda_terima_cek_angkutan_check check (cek_angkutan in ('belum','sudah'));
alter table public.tanda_terima drop constraint if exists tanda_terima_status_kirim_check;
alter table public.tanda_terima
  add constraint tanda_terima_status_kirim_check
  check (status_kirim in ('belum','tunggu_info','terkirim','batal'));
update public.tanda_terima set cek_angkutan = 'belum' where cek_angkutan is null;
create index if not exists tanda_terima_cek_idx on public.tanda_terima (cek_angkutan);

-- 2) RLS: baca semua user login; tulis/hapus khusus admin & superadmin.
alter table public.tanda_terima enable row level security;

drop policy if exists "tanda_terima select" on public.tanda_terima;
create policy "tanda_terima select" on public.tanda_terima
  for select using (auth.role() = 'authenticated');

drop policy if exists "tanda_terima insert admin" on public.tanda_terima;
create policy "tanda_terima insert admin" on public.tanda_terima
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

drop policy if exists "tanda_terima update admin" on public.tanda_terima;
create policy "tanda_terima update admin" on public.tanda_terima
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

drop policy if exists "tanda_terima delete admin" on public.tanda_terima;
create policy "tanda_terima delete admin" on public.tanda_terima
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'))
  );

-- CATATAN:
-- * Baca untuk semua user login; tulis/hapus admin & superadmin.
--   Kalau mau operator ikut mengisi, ubah p.role in (...) pada kebijakan di atas.
-- * updated_at tidak pakai trigger (di-set manual oleh app, mengikuti pola setoran_sj).
