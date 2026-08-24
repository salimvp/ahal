import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const BUCKET = process.env.SUPABASE_BUCKET_NAME || 'ssmo-assets';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const filePath = path.resolve('public/why-ssmo-video.mp4');
  if (!fs.existsSync(filePath)) {
    console.log('Video file not found at', filePath);
    return;
  }

  console.log('Reading video file...');
  const fileBuffer = fs.readFileSync(filePath);
  const key = 'videos/why-ssmo-video.mp4';

  console.log(`Uploading ${fileBuffer.length} bytes to Supabase Storage bucket "${BUCKET}" as "${key}"...`);

  // Ensure bucket exists
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET);
    if (!exists) {
      console.log(`Creating public bucket "${BUCKET}"...`);
      await supabase.storage.createBucket(BUCKET, { public: true });
    }
  } catch (e) {
    console.warn('Bucket check warning:', e.message);
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(key, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (error) {
    console.error('Upload failed:', error.message);
    process.exit(1);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
  console.log('Upload successful!');
  console.log('Public Video URL:', urlData.publicUrl);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
