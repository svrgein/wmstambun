-- DLI TAMBUN WMS — Update September 2026
-- Jalankan sekali di Supabase SQL Editor
-- Aman dijalankan berulang (semua pakai IF NOT EXISTS)

-- 1) Kolom contractor (kode proyek dari DO proyek)
ALTER TABLE public.tanda_terima
  ADD COLUMN IF NOT EXISTS contractor text null;

-- 2) Kolom setor_date (tanggal setoran aktual)
ALTER TABLE public.tanda_terima
  ADD COLUMN IF NOT EXISTS setor_date date null;
