/**
 * Storage Client (Supabase Storage)
 * 
 * Features:
 * - Uploads and deletes using Supabase Storage bucket (`ssmo-assets`)
 * - MIME and extension validation
 * - Safe cryptographic object key generation
 */

import { uploadFileToSupabase, deleteFileFromSupabase, getSupabase } from './supabase.js';
import crypto from 'node:crypto';

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf', 'doc', 'docx'
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/**
 * Validate upload file metadata
 */
export function validateUploadFile({ filename, contentType, size }) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Filename is required');
  }

  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`File extension .${ext} is not allowed.`);
  }

  if (contentType && !ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error(`File type ${contentType} is not allowed.`);
  }

  if (size && size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }

  return { ext, valid: true };
}

/**
 * Generate a safe unique key for storage
 * e.g. gallery/2026/08/uniqueId.webp
 */
export function generateObjectKey(folder = 'uploads', originalFilename = 'file') {
  const ext = (originalFilename.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPrefix = folder.replace(/^\/+|\/+$/g, '');
  const uniqueId = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  return `${cleanPrefix}/${uniqueId}.${ext}`;
}

/**
 * Upload a buffer to Supabase Storage
 */
export async function uploadToR2({ buffer, key, contentType = 'application/octet-stream' }) {
  return uploadFileToSupabase({ buffer, key, contentType });
}

/**
 * Delete an object from Supabase Storage
 */
export async function deleteFromR2(key) {
  return deleteFileFromSupabase(key);
}

/**
 * Delete multiple objects from Supabase Storage
 */
export async function deleteManyFromR2(keys) {
  if (!Array.isArray(keys)) return;
  for (const key of keys) {
    if (key) await deleteFileFromSupabase(key);
  }
}

/**
 * Get an object for proxying
 */
export async function getFromR2(key) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are required for file retrieval.');
  }

  const bucket = process.env.SUPABASE_BUCKET_NAME || 'ssmo-assets';
  const { data, error } = await supabase.storage.from(bucket).download(key);
  if (error || !data) return null;

  const arrayBuffer = await data.arrayBuffer();
  return {
    body: Buffer.from(arrayBuffer),
    contentType: data.type || 'application/octet-stream'
  };
}

export default {
  uploadToR2,
  deleteFromR2,
  deleteManyFromR2,
  getFromR2,
  generateObjectKey,
  validateUploadFile
};
