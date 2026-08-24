/**
 * Self-contained API Router — Pure Supabase Backend
 * Handles all CRUD endpoints directly with Supabase PostgreSQL and Supabase Storage.
 * Single serverless function entry point via api/index.js.
 */

import crypto from 'node:crypto';
import Busboy from 'busboy';
import { getSupabase, uploadFileToSupabase, deleteFileFromSupabase, getPublicUrl } from './supabase.js';
import { requireAuth } from './auth.js';
import { json, error, parseBody } from './response.js';
import { checkRateLimit, validateEnquiryInput, getClientIp } from './security.js';

// ─── Route Matching ────────────────────────────────────────────────────────

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

  const supabase = getSupabase();
  let query = supabase.from('announcements').select('*');

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }
  if (search && search.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%`);
  }

  query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });

  const { data, error: sbErr } = await query;
  if (sbErr) throw sbErr;
  return json(res, data || []);
}

async function announcementsGet(req, res, id) {
  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('announcements').select('*').eq('id', id).maybeSingle();
  if (sbErr) throw sbErr;
  if (!data) return error(res, 'Not found', 404);
  return json(res, data);
}

async function announcementsCreate(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const { title, link = '', content = '', category = 'Notices', badge = 'NEW', image_key = null, attachment_key = null, is_pinned = false, is_active = true } = body;
  if (!title || !title.trim()) return error(res, 'Title is required', 400);

  const id = `ann-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80);

  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('announcements').insert({
    id,
    title: title.trim(),
    slug,
    content: content?.trim() || '',
    category,
    badge,
    link: link?.trim() || '',
    image_key,
    attachment_key,
    is_pinned: !!is_pinned,
    is_active: is_active !== false && is_active !== 0,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).select().single();

  if (sbErr) throw sbErr;
  return json(res, data, 201);
}

async function announcementsUpdate(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const updateData = {};

  for (const [key, val] of Object.entries(body)) {
    if (['title', 'content', 'category', 'badge', 'link', 'image_key', 'attachment_key'].includes(key)) {
      updateData[key] = val;
      if (key === 'title' && val) {
        updateData.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80);
      }
    }
    if (key === 'is_pinned') updateData.is_pinned = !!val;
    if (key === 'is_active') updateData.is_active = val !== false && val !== 0;
  }

  if (Object.keys(updateData).length === 0) return error(res, 'No fields to update', 400);
  updateData.updated_at = new Date().toISOString();

  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('announcements').update(updateData).eq('id', id).select().single();
  if (sbErr) throw sbErr;
  return json(res, data || { id });
}

async function announcementsDelete(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const supabase = getSupabase();
  const { error: sbErr } = await supabase.from('announcements').delete().eq('id', id);
  if (sbErr) throw sbErr;
  return json(res, { success: true, message: 'Deleted' });
}

// ─── Achievement Handlers ──────────────────────────────────────────────────

async function achievementsList(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const includeInactive = url.searchParams.get('includeInactive') === 'true';

  const supabase = getSupabase();
  let query = supabase.from('achievements').select('*');

  if (!includeInactive) {
    query = query.eq('is_published', true);
  }
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }
  if (search && search.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
  }

  query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });

  const { data, error: sbErr } = await query;
  if (sbErr) throw sbErr;
  return json(res, data || []);
}

async function achievementsGet(req, res, id) {
  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('achievements').select('*').eq('id', id).maybeSingle();
  if (sbErr) throw sbErr;
  if (!data) return error(res, 'Not found', 404);
  return json(res, data);
}

async function achievementsCreate(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const { title, subtitle = '', description = '', category = 'General', year = '2026', image_url = '', image_key = null, rank_badge = '', display_order = 0, is_published = true } = body;
  if (!title || !title.trim()) return error(res, 'Title is required', 400);

  const id = `ach-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('achievements').insert({
    id,
    title: title.trim(),
    subtitle: subtitle?.trim() || '',
    description: description?.trim() || '',
    category,
    year: String(year || '2026'),
    image_url: image_url?.trim() || '',
    image_key,
    rank_badge: rank_badge?.trim() || '',
    display_order: Number(display_order) || 0,
    is_published: is_published !== false && is_published !== 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).select().single();

  if (sbErr) throw sbErr;
  return json(res, data, 201);
}

async function achievementsUpdate(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const updateData = {};

  for (const [key, val] of Object.entries(body)) {
    if (['title', 'subtitle', 'description', 'category', 'year', 'image_url', 'image_key', 'rank_badge'].includes(key)) {
      updateData[key] = val;
    }
    if (key === 'display_order') updateData.display_order = Number(val) || 0;
    if (key === 'is_published' || key === 'is_active') updateData.is_published = val !== false && val !== 0;
  }

  if (Object.keys(updateData).length === 0) return error(res, 'No fields to update', 400);
  updateData.updated_at = new Date().toISOString();

  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('achievements').update(updateData).eq('id', id).select().single();
  if (sbErr) throw sbErr;
  return json(res, data || { id });
}

async function achievementsDelete(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const supabase = getSupabase();
  const { error: sbErr } = await supabase.from('achievements').delete().eq('id', id);
  if (sbErr) throw sbErr;
  return json(res, { success: true, message: 'Deleted' });
}

// ─── Gallery Handlers ──────────────────────────────────────────────────────

async function galleryList(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit'), 10);
  const includeInactive = url.searchParams.get('includeInactive') === 'true';

  const supabase = getSupabase();
  let query = supabase.from('gallery_photos').select('*');

  if (!includeInactive) {
    query = query.eq('is_published', true);
  }
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });

  if (limit && !isNaN(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error: sbErr } = await query;
  if (sbErr) throw sbErr;
  return json(res, data || []);
}

async function galleryGet(req, res, id) {
  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('gallery_photos').select('*').eq('id', id).maybeSingle();
  if (sbErr) throw sbErr;
  if (!data) return error(res, 'Not found', 404);
  return json(res, data);
}

async function galleryCreate(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const { title, category = 'Campus', image_url, image_key = null, description = '', album_id = null, display_order = 0, is_published = true } = body;
  if (!title || !title.trim()) return error(res, 'Title is required', 400);
  if (!image_url || !image_url.trim()) return error(res, 'Image URL is required', 400);

  const id = `gal-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('gallery_photos').insert({
    id,
    album_id: album_id || null,
    title: title.trim(),
    category,
    image_url: image_url.trim(),
    image_key,
    description: description?.trim() || '',
    display_order: Number(display_order) || 0,
    is_published: is_published !== false && is_published !== 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).select().single();

  if (sbErr) throw sbErr;
  return json(res, data, 201);
}

async function galleryUpdate(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const updateData = {};

  for (const [key, val] of Object.entries(body)) {
    if (['title', 'category', 'image_url', 'image_key', 'description', 'album_id'].includes(key)) {
      updateData[key] = val;
    }
    if (key === 'display_order') updateData.display_order = Number(val) || 0;
    if (key === 'is_published') updateData.is_published = val !== false && val !== 0;
  }

  if (Object.keys(updateData).length === 0) return error(res, 'No fields to update', 400);
  updateData.updated_at = new Date().toISOString();

  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('gallery_photos').update(updateData).eq('id', id).select().single();
  if (sbErr) throw sbErr;
  return json(res, data || { id });
}

async function galleryDelete(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const supabase = getSupabase();
  const { error: sbErr } = await supabase.from('gallery_photos').delete().eq('id', id);
  if (sbErr) throw sbErr;
  return json(res, { success: true, message: 'Deleted' });
}

// ─── Enquiries / Inquiries Handlers ────────────────────────────────────────

async function enquiriesList(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
  if (sbErr) throw sbErr;
  return json(res, data || []);
}

async function enquiriesGet(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('enquiries').select('*').eq('id', id).maybeSingle();
  if (sbErr) throw sbErr;
  if (!data) return error(res, 'Not found', 404);
  return json(res, data);
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
  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('enquiries').insert({
    id,
    name: validated.name,
    email: validated.email,
    phone: validated.phone || '',
    subject: validated.subject || 'General Query',
    message: validated.message,
    status: 'new',
    is_read: false,
    ip_address: ip,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).select().single();

  if (sbErr) throw sbErr;
  return json(res, { success: true, message: 'Enquiry submitted successfully', data }, 201);
}

async function enquiriesUpdate(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const updateData = {};

  if (body.is_read !== undefined) updateData.is_read = !!body.is_read;
  if (body.status !== undefined) updateData.status = body.status;
  updateData.updated_at = new Date().toISOString();

  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('enquiries').update(updateData).eq('id', id).select().single();
  if (sbErr) throw sbErr;
  return json(res, data || { id });
}

async function enquiriesDelete(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const supabase = getSupabase();
  const { error: sbErr } = await supabase.from('enquiries').delete().eq('id', id);
  if (sbErr) throw sbErr;
  return json(res, { success: true, message: 'Deleted' });
}

// ─── Settings Handler ──────────────────────────────────────────────────────

async function settingsGet(req, res) {
  const supabase = getSupabase();
  const { data, error: sbErr } = await supabase.from('settings').select('key, value');
  if (sbErr) throw sbErr;
  const map = {};
  for (const row of data || []) map[row.key] = row.value;
  return json(res, map);
}

async function settingsPut(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const supabase = getSupabase();

  const records = [];
  for (const [key, value] of Object.entries(body)) {
    if (typeof key === 'string' && key.trim()) {
      records.push({
        key: key.trim(),
        value: value != null ? String(value) : '',
        updated_at: new Date().toISOString()
      });
    }
  }

  if (records.length > 0) {
    const { error: sbErr } = await supabase.from('settings').upsert(records);
    if (sbErr) throw sbErr;
  }

  const { data } = await supabase.from('settings').select('key, value');
  const map = {};
  for (const row of data || []) map[row.key] = row.value;
  return json(res, map);
}

// ─── Upload Handler (Supabase Storage) ─────────────────────────────────────

async function uploadFile(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) return error(res, 'Content-Type must be multipart/form-data', 400);

  const uploadResult = await new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers, limits: { fileSize: 25 * 1024 * 1024 } });
    let folder = 'uploads';
    let fileProcessed = false;
    let uploadPromise = null;

    busboy.on('field', (name, val) => {
      if (name === 'folder' && val) folder = val.replace(/[^a-zA-Z0-9_-]/g, '');
    });

    busboy.on('file', (fieldname, fileStream, fileInfo) => {
      fileProcessed = true;
      const { filename, mimeType } = fileInfo;
      const cleanFilename = (filename || 'file').replace(/[^a-zA-Z0-9_.-]/g, '_');
      const ext = cleanFilename.includes('.') ? cleanFilename.split('.').pop().toLowerCase() : '';
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'mp4'];
      if (ext && !allowedExts.includes(ext)) {
        fileStream.resume();
        return reject(new Error(`File type .${ext} is not supported.`));
      }

      const chunks = [];
      fileStream.on('data', chunk => chunks.push(chunk));
      fileStream.on('limit', () => reject(new Error('File size exceeds 25MB limit')));
      fileStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const uniqueKey = `${folder}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${cleanFilename}`;
        uploadPromise = uploadFileToSupabase({
          buffer,
          key: uniqueKey,
          contentType: mimeType || 'application/octet-stream'
        }).then(r => ({
          ...r,
          originalFilename: filename,
          mimeType
        }));
      });
    });

    busboy.on('finish', async () => {
      if (!fileProcessed || !uploadPromise) return reject(new Error('No file was uploaded'));
      try {
        resolve(await uploadPromise);
      } catch (e) {
        reject(e);
      }
    });

    busboy.on('error', reject);
    req.pipe(busboy);
  });

  return json(res, {
    success: true,
    url: uploadResult.url,
    key: uploadResult.key,
    filename: uploadResult.originalFilename,
    size: uploadResult.size,
    storage: 'supabase'
  }, 201);
}

// ─── Files Proxy Handler ───────────────────────────────────────────────────

async function filesGet(req, res, key) {
  if (!key) return error(res, 'File key is required', 400);
  const publicUrl = getPublicUrl(key);
  res.writeHead(302, { Location: publicUrl });
  res.end();
}

// ─── Faculties Handlers ───────────────────────────────────────────────────

const DEFAULT_FACULTIES = [
  {
    id: 'fac-1',
    name: 'Shanavas Paravannur',
    designation: 'Principal',
    qualification: 'M.Ed, M.Phil',
    expertise: 'Educational Leadership & Administration',
    department: 'Administration',
    image_url: '/principal.jpeg',
    image_key: null,
    email: 'principal@ssmoite.edu.in',
    phone: '+91 494 2460300',
    display_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'fac-2',
    name: 'MK Bava Sahib',
    designation: 'Manager',
    qualification: 'M.A, B.Ed',
    expertise: 'Institutional Management',
    department: 'Administration',
    image_url: '/manager.jpeg',
    image_key: null,
    email: 'manager@ssmoite.edu.in',
    phone: '+91 494 2460300',
    display_order: 2,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'fac-3',
    name: 'Dr. A. Basheer',
    designation: 'Senior Lecturer, Pedagogy',
    qualification: 'M.Ed, Ph.D',
    expertise: 'Child Psychology & Curriculum Design',
    department: 'Pedagogy',
    image_url: '/principal.jpeg',
    image_key: null,
    email: 'basheer.pedagogy@ssmoite.edu.in',
    phone: '',
    display_order: 3,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  }
];

async function getFacultiesListHelper(supabase) {
  try {
    const { data, error: sbErr } = await supabase.from('faculties').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false });
    if (!sbErr && data) return data;
  } catch {}

  try {
    const { data: sData } = await supabase.from('settings').select('value').eq('key', 'faculties_data').maybeSingle();
    if (sData && sData.value) {
      const parsed = JSON.parse(sData.value);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return DEFAULT_FACULTIES;
}

async function saveFacultiesListHelper(supabase, list) {
  try {
    await supabase.from('settings').upsert({
      key: 'faculties_data',
      value: JSON.stringify(list),
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Fallback save to settings error:', e.message);
  }
}

async function facultiesList(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const department = url.searchParams.get('department');
  const search = url.searchParams.get('search');
  const includeInactive = url.searchParams.get('includeInactive') === 'true';

  const supabase = getSupabase();
  let list = [];

  try {
    let query = supabase.from('faculties').select('*');
    if (!includeInactive) query = query.eq('is_active', true);
    if (department && department !== 'All') query = query.eq('department', department);
    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,designation.ilike.%${search.trim()}%,expertise.ilike.%${search.trim()}%`);
    }
    query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
    const { data, error: sbErr } = await query;
    if (!sbErr && data) {
      return json(res, data || []);
    }
  } catch {}

  list = await getFacultiesListHelper(supabase);
  if (!includeInactive) list = list.filter(f => f.is_active !== false && f.is_active !== 0);
  if (department && department !== 'All') list = list.filter(f => f.department === department);
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(f => (f.name && f.name.toLowerCase().includes(q)) || (f.designation && f.designation.toLowerCase().includes(q)) || (f.expertise && f.expertise.toLowerCase().includes(q)));
  }
  list.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  return json(res, list);
}

async function facultiesGet(req, res, id) {
  const supabase = getSupabase();
  try {
    const { data, error: sbErr } = await supabase.from('faculties').select('*').eq('id', id).maybeSingle();
    if (!sbErr && data) return json(res, data);
  } catch {}

  const list = await getFacultiesListHelper(supabase);
  const item = list.find(f => f.id === id);
  if (!item) return error(res, 'Faculty member not found', 404);
  return json(res, item);
}

async function facultiesCreate(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const {
    name,
    department = '',
    designation = '',
    qualification = '',
    expertise = '',
    image_url = '',
    image_key = null,
    display_order = 0,
    is_active = true
  } = body;

  if (!name || !name.trim()) return error(res, 'Faculty name is required', 400);

  const id = `fac-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const newFaculty = {
    id,
    name: name.trim(),
    department: department?.trim() || '',
    designation: designation?.trim() || department?.trim() || '',
    qualification: qualification?.trim() || '',
    expertise: expertise?.trim() || '',
    image_url: image_url?.trim() || '',
    image_key: image_key || null,
    display_order: Number(display_order) || 0,
    is_active: is_active !== false && is_active !== 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  try {
    const { data, error: sbErr } = await supabase.from('faculties').insert(newFaculty).select().single();
    if (!sbErr && data) {
      return json(res, data, 201);
    }
  } catch {}

  const list = await getFacultiesListHelper(supabase);
  const updatedList = [newFaculty, ...list];
  await saveFacultiesListHelper(supabase, updatedList);
  return json(res, newFaculty, 201);
}

async function facultiesUpdate(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const body = await parseBody(req);
  const updateData = {};

  for (const [key, val] of Object.entries(body)) {
    if (['name', 'designation', 'qualification', 'expertise', 'department', 'image_url', 'image_key', 'email', 'phone'].includes(key)) {
      updateData[key] = val;
    }
    if (key === 'display_order') updateData.display_order = Number(val) || 0;
    if (key === 'is_active') updateData.is_active = val !== false && val !== 0;
  }

  if (Object.keys(updateData).length === 0) return error(res, 'No fields to update', 400);
  updateData.updated_at = new Date().toISOString();

  const supabase = getSupabase();
  try {
    const { data, error: sbErr } = await supabase.from('faculties').update(updateData).eq('id', id).select().single();
    if (!sbErr && data) {
      return json(res, data);
    }
  } catch {}

  const list = await getFacultiesListHelper(supabase);
  const idx = list.findIndex(f => f.id === id);
  if (idx === -1) return error(res, 'Faculty member not found', 404);
  list[idx] = { ...list[idx], ...updateData };
  await saveFacultiesListHelper(supabase, list);
  return json(res, list[idx]);
}

async function facultiesDelete(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const supabase = getSupabase();
  try {
    const { error: sbErr } = await supabase.from('faculties').delete().eq('id', id);
    if (!sbErr) {
      return json(res, { success: true, message: 'Deleted' });
    }
  } catch {}

  const list = await getFacultiesListHelper(supabase);
  const updatedList = list.filter(f => f.id !== id);
  await saveFacultiesListHelper(supabase, updatedList);
  return json(res, { success: true, message: 'Deleted' });
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
    if (path === '/api/admin/enquiries' || path === '/api/admin/inquiries') {
      if (method === 'GET') return await enquiriesList(req, res);
    }

    // Enquiry by ID
    const enqId = extractId(path, '/api/(?:admin/)?(?:enquiries|inquiries)');
    if (enqId) {
      const readMatch = path.match(/\/read$/);
      if (readMatch && (method === 'PATCH' || method === 'PUT')) {
        return await enquiriesUpdate(req, res, enqId);
      }
      if (method === 'GET') return await enquiriesGet(req, res, enqId);
      if (method === 'PATCH' || method === 'PUT') return await enquiriesUpdate(req, res, enqId);
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
      if (method === 'PUT' || method === 'PATCH') return await announcementsUpdate(req, res, annId);
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
      if (method === 'PUT' || method === 'PATCH') return await achievementsUpdate(req, res, achId);
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
      if (method === 'PUT' || method === 'PATCH') return await galleryUpdate(req, res, galId);
      if (method === 'DELETE') return await galleryDelete(req, res, galId);
    }

    // Faculties
    if (path === '/api/faculties' || path === '/api/admin/faculties') {
      if (method === 'GET') return await facultiesList(req, res);
      if (method === 'POST') return await facultiesCreate(req, res);
    }
    const facId = extractId(path, '/api/(?:admin/)?faculties');
    if (facId) {
      if (method === 'GET') return await facultiesGet(req, res, facId);
      if (method === 'PUT' || method === 'PATCH') return await facultiesUpdate(req, res, facId);
      if (method === 'DELETE') return await facultiesDelete(req, res, facId);
    }

    return error(res, `Route not found: ${method} ${path}`, 404);
  } catch (err) {
    console.error(`API Error [${method} ${path}]:`, err);
    return error(res, err.message || 'Internal Server Error', 500);
  }
}

