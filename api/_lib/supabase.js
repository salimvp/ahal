/**
 * Supabase Client & Storage Provider
 * 
 * Features:
 * - Supabase PostgreSQL client initialized with SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY
 * - Supabase Storage bucket operations (upload, delete, getPublicUrl)
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_BUCKET_NAME || 'ssmo-assets';

let supabaseInstance = null;

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
 * Upload a file to Supabase Storage
 */
export async function uploadFileToSupabase({ buffer, key, contentType = 'application/octet-stream' }) {
  const supabase = getSupabase();

  if (!supabase) {
    throw new Error('Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are required for file uploads.');
  }

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

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFileFromSupabase(key) {
  if (!key) return;
  const supabase = getSupabase();

  if (!supabase) {
    throw new Error('Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are required for file deletion.');
  }

  await supabase.storage.from(STORAGE_BUCKET).remove([key]);
}

/**
 * Execute table query with Supabase
 */
export async function dbQuery(table, queryBuilderFn) {
  const supabase = getSupabase();

  if (!supabase) {
    throw new Error('Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are required.');
  }

  const query = queryBuilderFn(supabase.from(table));
  const { data, error } = await query;
  if (error) {
    throw new Error(`Supabase Database Error: ${error.message}`);
  }
  return data;
}

export default {
  getSupabase,
  uploadFileToSupabase,
  deleteFileFromSupabase,
  dbQuery
};
