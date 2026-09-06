// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Konfigurasi WAJIB berasal dari environment, bukan di-hardcode di kode.
// Salin .env.local.example menjadi .env.local dan isi kredensial Anda sendiri.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase belum dikonfigurasi. Buat file .env.local (contoh ada di .env.local.example) lalu isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
