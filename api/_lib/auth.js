/**
 * Authentication Library — Supabase Auth Verification
 *
 * Verifies Supabase access tokens using SUPABASE_JWT_SECRET (HS256).
 */

import { jwtVerify } from 'jose';
import { getSupabase } from './supabase.js';
import { error as sendError } from './response.js';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

/**
 * Verify a Supabase access token (JWT) using the JWT secret.
 * Falls back to Supabase getUser if JWT verification fails.
 */
export async function verifySupabaseToken(token) {
  if (!token) return null;

  // 1. Primary: Verify JWT locally using SUPABASE_JWT_SECRET
  if (JWT_SECRET) {
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ['HS256'],
      });
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role || 'authenticated',
        aud: payload.aud,
      };
    } catch {
      // JWT invalid or expired — fall through to Supabase
    }
  }

  // 2. Fallback: Validate token with Supabase Auth
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        return {
          id: user.id,
          email: user.email,
          role: user.role || 'authenticated',
          user_metadata: user.user_metadata
        };
      }
    }
  } catch {
    // ignore
  }

  return null;
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
