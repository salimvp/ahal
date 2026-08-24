/**
 * Self-contained API Router — all handler logic inlined.
 * Single serverless function entry point via api/index.js.
 */

import crypto from 'node:crypto';
import Busboy from 'busboy';
import { d1Query } from './d1.js';
import { getSupabase, dbQuery, uploadFileToSupabase, deleteFileFromSupabase } from './supabase.js';
import { uploadToR2, deleteFromR2, deleteManyFromR2, getFromR2, generateObjectKey, validateUploadFile } from './r2.js';
import { requireAuth } from './auth.js';
import { json, error, parseBody } from './response.js';
import { checkRateLimit, validateEnquiryInput, getClientIp } from './security.js';

// ─── Route Matching ────────────────────────────────────────────────────────

function matchRoute(pathname, pattern) {
  const regex = new RegExp('^' + pattern.replace(/\//g, '\\/').replace(/:([^/]+)/g, '([^/]+)') + '$');
  return pathname.match(regex);
}

function extractId(pathname, prefix) {
  const re = new RegExp('^' + prefix.replace(/\//g, '\\/') + '/([^/]+)$');
  const m = pathname.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

// ─── Announcement Handlers ─────────────────────────────────────────────────

async function announcementsList(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const includeInactive = url.searchParams.get('includeInactive') === 'true';

  let sql = 'SELECT * FROM announcements WHERE 1=1';
  const params = [];

  if (!includeInactive) sql += ' AND is_active = 1';
  if (category && category !== 'All') { sql += ' AND category = ?'; params.push(category); }
  if (search && search.trim()) {
    sql += ' AND (title LIKE ? OR content LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }
  sql += ' ORDER BY is_pinned DESC, created_at DESC';
  const { results } = await d1Query(sql, params);
  return json(res, results || []);
}

async function announcementsGet(req, res, id) {
  const { results } = await d1Query('SELECT * FROM announcements WHERE id = ?', [id]);
  if (!results || results.length === 0) return error(res, 'Not found', 404);
  return json(res, results[0]);
}

async function announcementsCreate(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const { title, link = '', content = '', category = 'Notices', badge = 'NEW', image_key = null, attachment_key = null, is_pinned = false, is_active = true } = body;
  if (!title || !title.trim()) return error(res, 'Title is required', 400);

  const id = `ann-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80);

  await d1Query(
    `INSERT INTO announcements (id, title, slug, content, category, badge, link, image_key, attachment_key, is_pinned, is_active, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, title.trim(), slug, content?.trim() || '', category, badge, link?.trim() || '', image_key, attachment_key, is_pinned ? 1 : 0, is_active ? 1 : 0]
  );
  const { results } = await d1Query('SELECT * FROM announcements WHERE id = ?', [id]);
  return json(res, results?.[0] || { id, title }, 201);
}

async function announcementsUpdate(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const fields = [];
  const params = [];

  for (const [key, val] of Object.entries(body)) {
    if (['title', 'content', 'category', 'badge', 'link', 'image_key', 'attachment_key'].includes(key)) {
      fields.push(`${key} = ?`);
      params.push(val);
    }
    if (['is_pinned', 'is_active'].includes(key)) {
      fields.push(`${key} = ?`);
      params.push(val ? 1 : 0);
    }
  }

  if (fields.length === 0) return error(res, 'No fields to update', 400);
  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  await d1Query(`UPDATE announcements SET ${fields.join(', ')} WHERE id = ?`, params);
  const { results } = await d1Query('SELECT * FROM announcements WHERE id = ?', [id]);
  return json(res, results?.[0] || { id });
}

async function announcementsDelete(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  await d1Query('DELETE FROM announcements WHERE id = ?', [id]);
  return json(res, { success: true, message: 'Deleted' });
}

// ─── Achievement Handlers ──────────────────────────────────────────────────

async function achievementsList(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const includeInactive = url.searchParams.get('includeInactive') === 'true';

  let sql = 'SELECT * FROM achievements WHERE 1=1';
  const params = [];
  if (!includeInactive) sql += ' AND is_active = 1';
  if (category && category !== 'All') { sql += ' AND category = ?'; params.push(category); }
  if (search && search.trim()) { sql += ' AND (title LIKE ? OR description LIKE ?)'; const t = `%${search.trim()}%`; params.push(t, t); }
  sql += ' ORDER BY is_pinned DESC, created_at DESC';
  const { results } = await d1Query(sql, params);
  return json(res, results || []);
}

async function achievementsGet(req, res, id) {
  const { results } = await d1Query('SELECT * FROM achievements WHERE id = ?', [id]);
  if (!results || results.length === 0) return error(res, 'Not found', 404);
  return json(res, results[0]);
}

async function achievementsCreate(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const { title, description = '', category = 'General', image_key = null, is_active = true } = body;
  if (!title || !title.trim()) return error(res, 'Title is required', 400);
  const id = `ach-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  await d1Query(
    `INSERT INTO achievements (id, title, description, category, image_key, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, title.trim(), description?.trim() || '', category, image_key, is_active ? 1 : 0]
  );
  const { results } = await d1Query('SELECT * FROM achievements WHERE id = ?', [id]);
  return json(res, results?.[0] || { id, title }, 201);
}

async function achievementsUpdate(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const fields = [];
  const params = [];
  for (const [key, val] of Object.entries(body)) {
    if (['title', 'description', 'category', 'image_key'].includes(key)) { fields.push(`${key} = ?`); params.push(val); }
    if (key === 'is_active') { fields.push('is_active = ?'); params.push(val ? 1 : 0); }
  }
  if (fields.length === 0) return error(res, 'No fields to update', 400);
  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);
  await d1Query(`UPDATE achievements SET ${fields.join(', ')} WHERE id = ?`, params);
  const { results } = await d1Query('SELECT * FROM achievements WHERE id = ?', [id]);
  return json(res, results?.[0] || { id });
}

async function achievementsDelete(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  await d1Query('DELETE FROM achievements WHERE id = ?', [id]);
  return json(res, { success: true, message: 'Deleted' });
}

// ─── Gallery Handlers ──────────────────────────────────────────────────────

async function galleryList(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit'), 10);

  let sql = 'SELECT * FROM gallery_photos WHERE is_published = 1';
  const params = [];
  if (category && category !== 'All') { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY display_order ASC, created_at DESC';
  if (limit && !isNaN(limit) && limit > 0) { sql += ' LIMIT ?'; params.push(limit); }
  const { results } = await d1Query(sql, params);
  return json(res, results || []);
}

async function galleryGet(req, res, id) {
  const { results } = await d1Query('SELECT * FROM gallery_photos WHERE id = ?', [id]);
  if (!results || results.length === 0) return error(res, 'Not found', 404);
  return json(res, results[0]);
}

async function galleryCreate(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const { title, category = 'Campus', image_url, image_key = null, description = '', album_id = null, display_order = 0, is_published = 1 } = body;
  if (!title || !title.trim()) return error(res, 'Title is required', 400);
  if (!image_url || !image_url.trim()) return error(res, 'Image URL is required', 400);
  const id = `gal-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  await d1Query(
    `INSERT INTO gallery_photos (id, album_id, title, category, image_url, image_key, description, display_order, is_published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, album_id, title.trim(), category, image_url.trim(), image_key, description?.trim() || '', Number(display_order) || 0, is_published ? 1 : 0]
  );
  const { results } = await d1Query('SELECT * FROM gallery_photos WHERE id = ?', [id]);
  return json(res, results?.[0] || { id, title }, 201);
}

async function galleryUpdate(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const fields = [];
  const params = [];
  for (const [key, val] of Object.entries(body)) {
    if (['title', 'category', 'image_url', 'image_key', 'description', 'album_id'].includes(key)) { fields.push(`${key} = ?`); params.push(val); }
    if (['display_order', 'is_published'].includes(key)) { fields.push(`${key} = ?`); params.push(Number(val) || 0); }
  }
  if (fields.length === 0) return error(res, 'No fields to update', 400);
  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);
  await d1Query(`UPDATE gallery_photos SET ${fields.join(', ')} WHERE id = ?`, params);
  const { results } = await d1Query('SELECT * FROM gallery_photos WHERE id = ?', [id]);
  return json(res, results?.[0] || { id });
}

async function galleryDelete(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  await d1Query('DELETE FROM gallery_photos WHERE id = ?', [id]);
  return json(res, { success: true, message: 'Deleted' });
}

// ─── Enquiries / Inquiries Handlers ────────────────────────────────────────

async function enquiriesList(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const { results } = await d1Query('SELECT * FROM enquiries ORDER BY created_at DESC');
  return json(res, results || []);
}

async function enquiriesGet(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  const { results } = await d1Query('SELECT * FROM enquiries WHERE id = ?', [id]);
  if (!results || results.length === 0) return error(res, 'Not found', 404);
  return json(res, results[0]);
}

async function enquiriesCreate(req, res) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) return error(res, 'Too many requests. Please try again later.', 429);

  let validated;
  try {
    validated = validateEnquiryInput(await parseBody(req));
  } catch (err) {
    return error(res, err.message, 400);
  }

  const id = `enq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  await d1Query(
    `INSERT INTO enquiries (id, name, email, phone, subject, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [id, validated.name, validated.email, validated.phone, validated.subject, validated.message]
  );
  return json(res, { success: true, message: 'Enquiry submitted successfully' }, 201);
}

async function enquiriesUpdate(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  if (body.is_read !== undefined) {
    await d1Query('UPDATE enquiries SET is_read = ? WHERE id = ?', [body.is_read ? 1 : 0, id]);
  }
  const { results } = await d1Query('SELECT * FROM enquiries WHERE id = ?', [id]);
  return json(res, results?.[0] || { id });
}

async function enquiriesDelete(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  await d1Query('DELETE FROM enquiries WHERE id = ?', [id]);
  return json(res, { success: true, message: 'Deleted' });
}

// ─── Settings Handler ──────────────────────────────────────────────────────

async function settingsGet(req, res) {
  const { results } = await d1Query('SELECT key, value FROM settings');
  const map = {};
  for (const row of results || []) map[row.key] = row.value;
  return json(res, map);
}

async function settingsPut(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  for (const [key, value] of Object.entries(body)) {
    if (typeof key === 'string' && key.trim()) {
      const val = value != null ? String(value) : '';
      await d1Query(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
        [key.trim(), val]
      );
    }
  }
  const { results } = await d1Query('SELECT key, value FROM settings');
  const map = {};
  for (const row of results || []) map[row.key] = row.value;
  return json(res, map);
}

// ─── Upload Handler ────────────────────────────────────────────────────────

async function uploadFile(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) return error(res, 'Content-Type must be multipart/form-data', 400);

  const uploadResult = await new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers, limits: { fileSize: 25 * 1024 * 1024 } });
    let folder = 'uploads';
    let fileProcessed = false;
    let uploadPromise = null;

    busboy.on('field', (name, val) => { if (name === 'folder' && val) folder = val.replace(/[^a-zA-Z0-9_-]/g, ''); });
    busboy.on('file', (fieldname, fileStream, fileInfo) => {
      fileProcessed = true;
      const { filename, mimeType } = fileInfo;
      try { validateUploadFile({ filename, contentType: mimeType }); } catch (e) { fileStream.resume(); return reject(e); }
      const chunks = [];
      fileStream.on('data', chunk => chunks.push(chunk));
      fileStream.on('limit', () => reject(new Error('File size exceeds 25MB limit')));
      fileStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const key = generateObjectKey(folder, filename);
        uploadPromise = uploadToR2({ buffer, key, contentType: mimeType }).then(r => ({ ...r, originalFilename: filename, mimeType }));
      });
    });
    busboy.on('finish', async () => {
      if (!fileProcessed || !uploadPromise) return reject(new Error('No file was uploaded'));
      try { resolve(await uploadPromise); } catch (e) { reject(e); }
    });
    busboy.on('error', reject);
    req.pipe(busboy);
  });

  return json(res, { success: true, url: uploadResult.url, key: uploadResult.key, filename: uploadResult.originalFilename, size: uploadResult.size, storage: uploadResult.storage }, 201);
}

// ─── Files Proxy Handler ───────────────────────────────────────────────────

async function filesGet(req, res, key) {
  if (!key) return error(res, 'File key is required', 400);
  const file = await getFromR2(key);
  if (!file || !file.body) return error(res, 'File not found', 404);
  if (file.contentType) res.setHeader('Content-Type', file.contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  if (typeof file.body.pipe === 'function') file.body.pipe(res);
  else if (Buffer.isBuffer(file.body)) res.end(file.body);
  else { const buf = await file.body.arrayBuffer(); res.end(Buffer.from(buf)); }
}

// ─── Main Router ───────────────────────────────────────────────────────────

export async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method;

  try {
    // Settings
    if (path === '/api/settings') {
      if (method === 'GET') return await settingsGet(req, res);
      if (method === 'PUT') return await settingsPut(req, res);
    }

    // Upload
    if (path === '/api/upload' && method === 'POST') return await uploadFile(req, res);

    // Files proxy
    const fileMatch = path.match(/^\/api\/files\/(.+)$/);
    if (fileMatch && method === 'GET') return await filesGet(req, res, decodeURIComponent(fileMatch[1]));

    // Enquiries (public create)
    if (path === '/api/enquiries' || path === '/api/inquiries') {
      if (method === 'GET') return await enquiriesList(req, res);
      if (method === 'POST') return await enquiriesCreate(req, res);
    }

    // Admin enquiries
    if (path === '/api/admin/enquiries') {
      if (method === 'GET') return await enquiriesList(req, res);
    }

    // Enquiry by ID
    const enqId = extractId(path, '/api/(?:admin/)?(?:enquiries|inquiries)');
    if (enqId) {
      const readMatch = path.match(/\/read$/);
      if (readMatch && method === 'PATCH') {
        return await enquiriesUpdate(req, res, enqId);
      }
      if (method === 'GET') return await enquiriesGet(req, res, enqId);
      if (method === 'PATCH') return await enquiriesUpdate(req, res, enqId);
      if (method === 'DELETE') return await enquiriesDelete(req, res, enqId);
    }

    // Announcements
    if (path === '/api/announcements' || path === '/api/admin/announcements') {
      if (method === 'GET') return await announcementsList(req, res);
      if (method === 'POST') return await announcementsCreate(req, res);
    }
    const annId = extractId(path, '/api/(?:admin/)?announcements');
    if (annId) {
      if (method === 'GET') return await announcementsGet(req, res, annId);
      if (method === 'PUT') return await announcementsUpdate(req, res, annId);
      if (method === 'DELETE') return await announcementsDelete(req, res, annId);
    }

    // Achievements
    if (path === '/api/achievements' || path === '/api/admin/achievements') {
      if (method === 'GET') return await achievementsList(req, res);
      if (method === 'POST') return await achievementsCreate(req, res);
    }
    const achId = extractId(path, '/api/(?:admin/)?achievements');
    if (achId) {
      if (method === 'GET') return await achievementsGet(req, res, achId);
      if (method === 'PUT') return await achievementsUpdate(req, res, achId);
      if (method === 'DELETE') return await achievementsDelete(req, res, achId);
    }

    // Gallery
    if (path === '/api/gallery' || path === '/api/admin/gallery') {
      if (method === 'GET') return await galleryList(req, res);
      if (method === 'POST') return await galleryCreate(req, res);
    }
    const galId = extractId(path, '/api/(?:admin/)?gallery');
    if (galId) {
      if (method === 'GET') return await galleryGet(req, res, galId);
      if (method === 'PUT') return await galleryUpdate(req, res, galId);
      if (method === 'DELETE') return await galleryDelete(req, res, galId);
    }

    return error(res, `Route not found: ${method} ${path}`, 404);
  } catch (err) {
    console.error(`API Error [${method} ${path}]:`, err);
    return error(res, err.message || 'Internal Server Error', 500);
  }
}
