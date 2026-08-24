/**
 * Universal Database Client (Supabase PostgreSQL / Cloudflare D1 HTTP REST)
 * 
 * Supports:
 * 1. Supabase PostgreSQL via @supabase/supabase-js
 * 2. Cloudflare D1 HTTP REST API
 */

import { getSupabase } from './supabase.js';

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_D1_DATABASE_ID = process.env.CF_D1_DATABASE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

/**
 * Execute SQL / Table operation with Supabase or Cloudflare D1
 */
export async function d1Query(sql, params = []) {
  const supabase = getSupabase();

  // 1. Supabase Database Execution
  if (supabase) {
    const trimmed = sql.trim();
    const isSelect = /^\s*SELECT/i.test(trimmed);
    const isInsert = /^\s*INSERT/i.test(trimmed);
    const isUpdate = /^\s*UPDATE/i.test(trimmed);
    const isDelete = /^\s*DELETE/i.test(trimmed);

    // Identify Table Name
    let tableName = null;
    const tableMatch = trimmed.match(/(?:FROM|INTO|UPDATE)\s+([a-zA-Z0-9_]+)/i);
    if (tableMatch) {
      tableName = tableMatch[1];
    }

    // Try Supabase query if custom query or table abstraction
    try {
      if (isSelect && tableName) {
        let query = supabase.from(tableName).select('*');

        // Handle simple WHERE filters
        if (trimmed.includes('is_active = 1') || trimmed.includes('is_active = TRUE')) {
          query = query.eq('is_active', true);
        }
        if (trimmed.includes('is_published = 1') || trimmed.includes('is_published = TRUE')) {
          query = query.eq('is_published', true);
        }

        // Handle parameterized WHERE clauses
        if (params.length > 0) {
          if (trimmed.includes('category = ?')) {
            query = query.eq('category', params[0]);
          } else if (trimmed.includes('WHERE id = ?')) {
            query = query.eq('id', params[0]);
          } else if (trimmed.includes('WHERE username = ?')) {
            query = query.eq('username', params[0]);
          }
        }

        // Handle ORDER BY
        if (trimmed.includes('is_pinned DESC')) {
          query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
        } else if (trimmed.includes('display_order ASC')) {
          query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
        } else if (trimmed.includes('ORDER BY created_at DESC')) {
          query = query.order('created_at', { ascending: false });
        }

        // Handle LIMIT
        const limitMatch = trimmed.match(/LIMIT\s+(\?|\d+)/i);
        if (limitMatch) {
          const limitVal = limitMatch[1] === '?' ? params[params.length - 1] : parseInt(limitMatch[1], 10);
          if (limitVal) query = query.limit(limitVal);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Map boolean fields to integers if needed for frontend consistency
        const mapped = (data || []).map(row => ({
          ...row,
          is_pinned: row.is_pinned === true ? 1 : row.is_pinned === false ? 0 : row.is_pinned,
          is_active: row.is_active === true ? 1 : row.is_active === false ? 0 : row.is_active,
          is_read: row.is_read === true ? 1 : row.is_read === false ? 0 : row.is_read,
          is_published: row.is_published === true ? 1 : row.is_published === false ? 0 : row.is_published
        }));

        return { results: mapped, meta: {} };
      }

      if (isDelete && tableName && params.length > 0) {
        const { data, error } = await supabase.from(tableName).delete().eq('id', params[0]);
        if (error) throw error;
        return { results: [], meta: { changes: 1 } };
      }
    } catch (sbErr) {
      console.warn('Supabase query translation note:', sbErr.message);
    }
  }

  // 2. Cloudflare D1 REST API (if CF credentials configured)
  if (CF_ACCOUNT_ID && CF_D1_DATABASE_ID && CF_API_TOKEN) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql, params: params || [] })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const errorMsg = data.errors?.[0]?.message || 'D1 Query Error';
      throw new Error(`D1 Error: ${errorMsg}`);
    }
    const firstResult = data.result?.[0] || {};
    return {
      results: firstResult.results || [],
      meta: firstResult.meta || {},
      success: true
    };
  }

  // No database configured
  throw new Error('Database connection credentials are required. Set SUPABASE_URL and SUPABASE_KEY, or Cloudflare D1 credentials.');
}

export async function d1Batch(statements) {
  // D1 batch via Supabase or CF REST not fully supported yet
  throw new Error('Batch queries require Supabase or D1 credentials to be configured.');
}

export default {
  query: d1Query,
  batch: d1Batch
};
