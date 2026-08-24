/**
 * Supabase Client & Storage Provider
 * 
 * Features:
 * - Supabase PostgreSQL client initialized with SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY
 * - Supabase Storage bucket operations (upload, delete, getPublicUrl)
 * - Local SQLite & filesystem storage fallback for local development if credentials are not configured yet
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_BUCKET_NAME || 'ssmo-assets';

let supabaseInstance = null;
let localDbInstance = null;

/**
 * Get or create Supabase Client
 */
export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }

  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return supabaseInstance;
}

/**
 * Local SQLite Database Fallback (when SUPABASE_URL is not set yet)
 */
async function getLocalDb() {
  if (localDbInstance) return localDbInstance;

  try {
    const Database = (await import('better-sqlite3')).default;
    const dataDir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'local-d1.sqlite');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Run initial schema if database is empty
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='announcements'").all();
    if (tables.length === 0) {
      const schemaPath = path.join(process.cwd(), 'migrations', '0001_initial_schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql);
      }
    }

    localDbInstance = db;
    return localDbInstance;
  } catch (err) {
    console.warn('Local SQLite fallback initialization note:', err.message);
    return null;
  }
}

/**
 * Upload a file to Supabase Storage (with local fallback)
 */
export async function uploadFileToSupabase({ buffer, key, contentType = 'application/octet-stream' }) {
  const supabase = getSupabase();

  if (supabase) {
    // 1. Upload to Supabase Storage Bucket
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(key, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      throw new Error(`Supabase Storage Error: ${error.message}`);
    }

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(key);

    return {
      key,
      url: urlData.publicUrl,
      size: buffer.length,
      storage: 'supabase'
    };
  }

  // Local fallback
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFileName = key.replace(/\//g, '-');
  const targetPath = path.join(uploadsDir, localFileName);
  fs.writeFileSync(targetPath, buffer);

  return {
    key,
    url: `/uploads/${localFileName}`,
    size: buffer.length,
    storage: 'local'
  };
}

/**
 * Delete a file from Supabase Storage (with local fallback)
 */
export async function deleteFileFromSupabase(key) {
  if (!key) return;
  const supabase = getSupabase();

  if (supabase) {
    try {
      await supabase.storage.from(STORAGE_BUCKET).remove([key]);
    } catch (err) {
      console.warn(`Failed to delete key "${key}" from Supabase Storage:`, err.message);
    }
    return;
  }

  // Local fallback
  try {
    const localFileName = key.replace(/\//g, '-');
    const localPath = path.join(process.cwd(), 'public', 'uploads', localFileName);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  } catch (err) {
    console.warn(`Failed to delete local file "${key}":`, err.message);
  }
}

/**
 * Execute SQL or table query with Supabase / local SQLite fallback
 */
export async function dbQuery(table, queryBuilderFn, localSql, localParams = []) {
  const supabase = getSupabase();

  if (supabase) {
    const query = queryBuilderFn(supabase.from(table));
    const { data, error } = await query;
    if (error) {
      throw new Error(`Supabase Database Error: ${error.message}`);
    }
    return data;
  }

  // Local fallback
  const localDb = await getLocalDb();
  if (!localDb) {
    throw new Error('Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are required.');
  }

  const isSelect = /^\s*(SELECT|PRAGMA)/i.test(localSql.trim());
  if (isSelect) {
    const stmt = localDb.prepare(localSql);
    return stmt.all(...localParams);
  } else {
    const stmt = localDb.prepare(localSql);
    const info = stmt.run(...localParams);
    return {
      changes: info.changes,
      lastInsertRowid: info.lastInsertRowid
    };
  }
}

export default {
  getSupabase,
  uploadFileToSupabase,
  deleteFileFromSupabase,
  dbQuery
};
