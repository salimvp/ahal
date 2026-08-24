/**
 * Authentication Library — Supabase Auth Verification
 *
 * Features:
 * - Verify Supabase access tokens using Supabase Auth client & JWKS/JWT fallback
 * - Authentication Middleware for protected API routes
 */

import 'dotenv/config';
import { importJWK, jwtVerify } from 'jose';
import { getSupabase } from './supabase.js';
import { error as sendError } from './response.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const JWKS_URL = SUPABASE_URL ? `${SUPABASE_URL}/auth/v1/.well-known/jwks.json` : null;

let cachedKeys = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch Supabase JWKS (JSON Web Key Set) and cache it
 */
async function fetchJWKS() {
  if (cachedKeys && Date.now() - cacheTime < CACHE_TTL) return cachedKeys;
  if (!JWKS_URL) return null;

  try {
    const res = await fetch(JWKS_URL);
    if (!res.ok) return cachedKeys;
    const data = await res.json();
    cachedKeys = data.keys || [];
    cacheTime = Date.now();
    return cachedKeys;
  } catch {
    return cachedKeys;
  }
}

/**
 * Verify a Supabase access token (JWT) using JWKS fallback
 * Returns the decoded user payload or null if invalid.
 */
export async function verifySupabaseToken(token) {
  if (!token) return null;

  // 1. Primary: Direct Supabase getUser validation
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
  } catch (err) {
    // Continue to JWKS fallback
  }

  // 2. Secondary: JWKS verification
  if (JWKS_URL) {
    try {
      const keys = await fetchJWKS();
      if (keys && keys.length > 0) {
        for (const jwk of keys) {
          try {
            const publicKey = await importJWK(jwk, jwk.alg || 'ES256');
            const { payload } = await jwtVerify(token, publicKey, {
              algorithms: ['ES256'],
            });
            return {
              id: payload.sub,
              email: payload.email,
              role: payload.role || 'authenticated',
              aud: payload.aud,
            };
          } catch {
            continue;
          }
        }
      }
    } catch {
      // ignore
    }
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
