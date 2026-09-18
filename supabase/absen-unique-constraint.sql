-- Prevent duplicate absen rows for same angkutan on same date
-- Safe to run multiple times (IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'absen_harian_angkutan_tanggal_unique'
  ) THEN
    ALTER TABLE public.absen_harian
      ADD CONSTRAINT absen_harian_angkutan_tanggal_unique
      UNIQUE (angkutan_id, tanggal);
  END IF;
END $$;
