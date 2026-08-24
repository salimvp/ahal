/**
 * Authentication Library — Supabase JWT Verification
 *
 * Features:
 * - Verify Supabase access tokens (JWT) using SUPABASE_JWT_SECRET
 * - Authentication Middleware for protected API routes
 */

import jwt from 'jsonwebtoken';
import { error as sendError } from './response.js';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

/**
 * Verify a Supabase access token (JWT)
 * Returns the decoded user payload or null if invalid.
 */
export function verifySupabaseToken(token) {
  if (!token || !SUPABASE_JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || 'authenticated',
      aud: decoded.aud,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Extract and verify the user from the Authorization header
 */
export function verifyAuthToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  return verifySupabaseToken(token);
}

/**
 * Middleware: Requires valid Supabase auth token
 * Returns the authenticated user or sends a 401 error.
 */
export function requireAuth(req, res) {
  const user = verifyAuthToken(req);
  if (!user) {
    sendError(res, 'Unauthorized: Valid authentication required', 401);
    return null;
  }
  req.user = user;
  return user;
}

export default {
  verifySupabaseToken,
  verifyAuthToken,
  requireAuth,
};
