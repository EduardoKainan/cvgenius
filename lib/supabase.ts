import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://sua-url-do-supabase.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
