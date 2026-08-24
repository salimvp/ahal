/**
 * Admin Authentication & Security Library
 * 
 * Features:
 * - PBKDF2 Password Hashing (SHA-512 with random salt)
 * - JWT Sign & Verify
 * - Admin credentials verification (Supabase Database & Environment fallback)
 * - Authentication Middleware
 */

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { getSupabase, dbQuery } from './supabase.js';
import { error } from './response.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'ssmo-default-jwt-secret-key-2026';
const DEFAULT_ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'ssmo@admin2026';

/**
 * Hash password with PBKDF2 and random salt
 */
export function hashPassword(password, salt = null) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

/**
 * Verify password against stored hash and salt
 */
export function verifyPassword(password, storedHash, salt) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

/**
 * Generate a JWT token for authenticated admin
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id || 'admin',
      username: user.username,
      role: user.role || 'admin'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Authenticate admin by username & password
 */
export async function authenticateAdmin(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  // 1. Check if admin exists in Supabase database
  try {
    const records = await dbQuery(
      'admins',
      (q) => q.select('id, username, password_hash, salt, role').eq('username', username).limit(1),
      'SELECT id, username, password_hash, salt, role FROM admins WHERE username = ? LIMIT 1',
      [username]
    );

    if (records && records.length > 0) {
      const adminRecord = records[0];
      const isValid = verifyPassword(password, adminRecord.password_hash, adminRecord.salt);
      if (isValid) {
        return {
          id: adminRecord.id,
          username: adminRecord.username,
          role: adminRecord.role || 'admin'
        };
      } else {
        throw new Error('Invalid username or password');
      }
    }
  } catch (err) {
    if (err.message === 'Invalid username or password') throw err;
    console.warn('Database admin check fallback to env admin:', err.message);
  }

  // 2. Fallback to Environment Default Admin credentials
  if (username === DEFAULT_ADMIN_USER && password === DEFAULT_ADMIN_PASS) {
    return {
      id: 'env-admin',
      username: DEFAULT_ADMIN_USER,
      role: 'admin'
    };
  }

  throw new Error('Invalid username or password');
}

/**
 * Update Admin Password in Supabase Database
 */
export async function updateAdminPassword(username, currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  // Verify current credentials first
  await authenticateAdmin(username, currentPassword);

  const { hash, salt } = hashPassword(newPassword);
  const adminId = `admin-${username}`;

  const supabase = getSupabase();
  if (supabase) {
    const { error: upsertErr } = await supabase
      .from('admins')
      .upsert({
        id: adminId,
        username,
        password_hash: hash,
        salt,
        role: 'admin',
        updated_at: new Date().toISOString()
      }, { onConflict: 'username' });

    if (upsertErr) {
      throw new Error(`Failed to update password: ${upsertErr.message}`);
    }
  } else {
    // Local SQLite fallback
    await dbQuery(
      'admins',
      () => {},
      `INSERT INTO admins (id, username, password_hash, salt, role, updated_at)
       VALUES (?, ?, ?, ?, 'admin', CURRENT_TIMESTAMP)
       ON CONFLICT(username) DO UPDATE SET
         password_hash = excluded.password_hash,
         salt = excluded.salt,
         updated_at = CURRENT_TIMESTAMP`,
      [adminId, username, hash, salt]
    );
  }

  return { success: true, message: 'Password updated successfully' };
}

/**
 * Verify JWT token from Request headers
 */
export function verifyAuthToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware: Requires valid admin JWT token
 */
export function requireAuth(req, res) {
  const user = verifyAuthToken(req);
  if (!user) {
    error(res, 'Unauthorized: Valid admin authentication token required', 401);
    return null;
  }
  req.user = user;
  return user;
}

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  authenticateAdmin,
  updateAdminPassword,
  verifyAuthToken,
  requireAuth
};
