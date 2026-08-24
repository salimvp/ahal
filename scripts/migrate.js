#!/usr/bin/env node

/**
 * SSMO Cloudflare D1 Migration Runner
 * 
 * Usage:
 *   node scripts/migrate.js
 * 
 * Supports:
 * 1. Cloudflare D1 Database via Cloudflare REST API (if env variables are set)
 * 2. Local SQLite fallback (if env variables are not set)
 */

import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_D1_DATABASE_ID = process.env.CF_D1_DATABASE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

async function runMigration() {
  const migrationPath = path.join(process.cwd(), 'migrations', '0001_initial_schema.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error('Migration file not found:', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('----------------------------------------------------');
  console.log(' SSMO College - Cloudflare D1 Database Migrator');
  console.log('----------------------------------------------------');

  if (CF_ACCOUNT_ID && CF_D1_DATABASE_ID && CF_API_TOKEN) {
    console.log(`[Cloudflare D1] Connecting to database: ${CF_D1_DATABASE_ID}`);
    console.log(`[Cloudflare D1] Account ID: ${CF_ACCOUNT_ID}`);

    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error('Migration failed:', data.errors || data);
        process.exit(1);
      }

      console.log('Migration executed successfully on Cloudflare D1!');
      console.log('Results summary:', data.result?.length, 'statement batches executed.');
    } catch (err) {
      console.error('Error connecting to Cloudflare D1:', err.message);
      process.exit(1);
    }
  } else {
    console.log('[Local SQLite] No Cloudflare credentials detected. Running local migration on .data/local-d1.sqlite...');
    try {
      const Database = (await import('better-sqlite3')).default;
      const dataDir = path.join(process.cwd(), '.data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const db = new Database(path.join(dataDir, 'local-d1.sqlite'));
      db.exec(sql);
      console.log('Local SQLite migration executed successfully!');
    } catch (err) {
      console.error('Error executing local migration:', err.message);
      process.exit(1);
    }
  }
}

runMigration();
