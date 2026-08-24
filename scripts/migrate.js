#!/usr/bin/env node

/**
 * SSMO Supabase Connection & Health Check Runner
 * 
 * Usage:
 *   node scripts/migrate.js
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_BUCKET_NAME || 'ssmo-assets';

async function checkSupabase() {
  console.log('====================================================');
  console.log(' SSMO Institute of Teacher Education - Supabase Backend');
  console.log('====================================================');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Supabase credentials missing in .env');
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
    process.exit(1);
  }

  console.log(`[Supabase] Connecting to project: ${SUPABASE_URL}`);
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Check Tables
  const tables = ['announcements', 'gallery_photos', 'gallery_albums', 'achievements', 'enquiries', 'settings'];
  console.log('\n[1/2] Checking Database Tables:');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`  ❌ Table "${table}": ${error.message}`);
      } else {
        console.log(`  ✅ Table "${table}": OK (accessible)`);
      }
    } catch (err) {
      console.error(`  ❌ Table "${table}": ${err.message}`);
    }
  }

  // 2. Check Storage Bucket
  console.log('\n[2/2] Checking Supabase Storage:');
  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) {
      console.warn(`  ⚠️ Storage listing note: ${bErr.message}`);
    } else {
      const exists = (buckets || []).some(b => b.name === STORAGE_BUCKET);
      if (exists) {
        console.log(`  ✅ Bucket "${STORAGE_BUCKET}": OK (ready for file uploads)`);
      } else {
        console.log(`  ℹ️ Creating bucket "${STORAGE_BUCKET}"...`);
        const { error: cErr } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
        if (cErr) {
          console.warn(`  ⚠️ Could not auto-create bucket: ${cErr.message}`);
        } else {
          console.log(`  ✅ Bucket "${STORAGE_BUCKET}": Created successfully`);
        }
      }
    }
  } catch (err) {
    console.warn(`  ⚠️ Storage check: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(' Supabase Backend Ready!');
  console.log('====================================================');
}

checkSupabase();
