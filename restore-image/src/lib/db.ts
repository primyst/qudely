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

const table = 'restorations';

export async function insertRestoration(record: RestorationRecord) {
  if (!supabaseAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  const { data, error } = await supabaseAdmin.from(table).insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function updateRestoration(id: string, patch: Partial<RestorationRecord>) {
  if (!supabaseAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  const { data, error } = await supabaseAdmin.from(table).update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function getRestoration(id: string) {
  if (!supabaseAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  const { data, error } = await supabaseAdmin.from(table).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
