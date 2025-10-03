import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Get authenticated user from request
 * - First tries Supabase cookie session (SSR helper)
 * - Falls back to Authorization: Bearer <token>
 */
export async function getUserFromRequest(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> {
  // Try server cookie-based user
  const supabaseServer = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (user) return user;

  // Fallback: Authorization header
  const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { data: tokenUser, error } = await supabaseAdmin!.auth.getUser(token);
      if (!error && tokenUser?.user) {
        return tokenUser.user;
      }
    } catch {
      return null;
    }
  }

  return null;
}