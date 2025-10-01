import { supabaseAdmin } from './supabase';

export type RestorationRecord = {
  id?: string;
  user_id?: string | null;
  input_url: string;
  restored_url?: string | null;
  colorized_url?: string | null;
  status: 'pending' | 'restoring' | 'colorizing' | 'done' | 'failed';
  created_at?: string;
  meta?: any;
};

const TABLE = 'restorations';

function ensureAdmin() {
  if (!supabaseAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (server-only)');
}

export async function insertRestoration(record: Partial<RestorationRecord>) {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!.from(TABLE).insert(record).select().single();
  if (error) throw error;
  return data as RestorationRecord;
}

export async function updateRestoration(id: string, patch: Partial<RestorationRecord>) {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!.from(TABLE).update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as RestorationRecord;
}

export async function getRestoration(id: string) {
  ensureAdmin();
  const { data, error } = await supabaseAdmin!.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data as RestorationRecord;
}
