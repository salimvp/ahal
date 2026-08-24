/**
 * Supabase Client & Storage Provider
 * 
 * SSMO Institute of Teacher Education - Backend
 * Pure Supabase Backend: PostgreSQL Database + Auth + Storage
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_BUCKET_NAME || 'ssmo-assets';

let supabaseInstance = null;

/**
 * Get or create Supabase Client (Service Role / Server-side)
 */
export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY) are required.');
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
 * Upload a file to Supabase Storage bucket
 */
export async function uploadFileToSupabase({ buffer, key, contentType = 'application/octet-stream' }) {
  const supabase = getSupabase();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(key, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Supabase Storage Error: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(key);

  return {
    key,
    path: data?.path || key,
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

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([key]);
  if (error) {
    console.warn(`Supabase Storage remove warning for key "${key}":`, error.message);
  }
}

/**
 * Get public URL of a file from Supabase Storage
 */
export function getPublicUrl(key) {
  if (!key) return '';
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  const supabase = getSupabase();
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

export default {
  getSupabase,
  uploadFileToSupabase,
  deleteFileFromSupabase,
  getPublicUrl
};
