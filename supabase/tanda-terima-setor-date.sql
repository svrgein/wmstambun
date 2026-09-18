-- Tambah kolom setor_date ke tabel tanda_terima
-- Jalankan sekali di Supabase SQL Editor
ALTER TABLE public.tanda_terima
  ADD COLUMN IF NOT EXISTS setor_date date null;
