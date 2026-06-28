// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hmuferpzphcnexsrxzgw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GuocXlgrC8zvdGvxv5Fd0w_OyWdxQTv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);