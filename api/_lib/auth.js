/**
 * Authentication Library — Supabase Auth Verification
 *
 * Verifies Supabase access tokens using Supabase Auth getUser API.
 */

import { getSupabase } from './supabase.js';
import { error as sendError } from './response.js';

/**
 * Verify a Supabase access token by calling Supabase Auth getUser.
 */
export async function verifySupabaseToken(token) {
  if (!token) return null;

  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role || 'authenticated',
      user_metadata: user.user_metadata
    };
  } catch {
    return null;
  }
}

/**
 * Middleware: Requires valid Supabase auth token
 * Returns the authenticated user or sends a 401 error.
 */
export async function requireAuth(req, res) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Unauthorized: Valid authentication required', 401);
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token) {
    sendError(res, 'Unauthorized: Valid authentication required', 401);
    return null;
  }

  const user = await verifySupabaseToken(token);
  if (!user) {
    sendError(res, 'Unauthorized: Valid authentication required', 401);
    return null;
  }
  req.user = user;
  return user;
}

export default {
  verifySupabaseToken,
  requireAuth,
};
