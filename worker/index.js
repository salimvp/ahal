/**
 * SSMO Institute of Teacher Education — Cloudflare Worker
 * Full-stack Cloudflare Worker + Static Assets + Supabase Backend
 */

import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function error(message, status = 400, details = null) {
  return new Response(JSON.stringify({ error: message, details }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function getEnv(env, key) {
  if (env && env[key]) return env[key];
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  return '';
}

export function getSupabase(env) {
  const url = getEnv(env, 'SUPABASE_URL') || getEnv(env, 'VITE_SUPABASE_URL');
  const key =
    getEnv(env, 'SUPABASE_SERVICE_ROLE_KEY') ||
    getEnv(env, 'SUPABASE_ANON_KEY') ||
    getEnv(env, 'SUPABASE_KEY') ||
    getEnv(env, 'VITE_SUPABASE_ANON_KEY');

  if (!url || !key) {
    throw new Error('Supabase credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY) are required.');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function requireAuth(request, env) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token) return null;

  try {
    const supabase = getSupabase(env);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (!authErr && user) {
      return user;
    }
  } catch (err) {
    console.error('Auth verification error:', err);
  }
  return null;
}

function generateId(prefix) {
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

function extractId(pathname, prefix) {
  const re = new RegExp('^' + prefix.replace(/\//g, '\\/') + '/([^/]+)$');
  const m = pathname.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

// ─── Default Faculty Fallback ────────────────────────────────────────────────

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
    updated_at: '2026-01-01T00:00:00.000Z',
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
    updated_at: '2026-01-01T00:00:00.000Z',
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
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

async function getFacultiesHelper(supabase) {
  try {
    const { data, error: sbErr } = await supabase
      .from('faculties')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (!sbErr && data && data.length > 0) return data;
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

// ─── API Router Handler ──────────────────────────────────────────────────────

export async function handleApiRequest(request, env) {
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  let path = url.pathname.replace(/\/+$/, '') || '/';
  if (!path.startsWith('/api') && path !== '/') {
    path = `/api/${path.replace(/^\/+/, '')}`;
  }

  try {
    const supabase = getSupabase(env);

    // 1. Health / Root
    if (path === '/api' || path === '/api/health') {
      return json({
        status: 'ok',
        platform: 'Cloudflare Workers',
        message: 'SSMO API is active',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Settings
    if (path === '/api/settings') {
      if (method === 'GET') {
        const { data, error: sbErr } = await supabase.from('settings').select('key, value');
        if (sbErr) throw sbErr;
        const map = {};
        for (const row of data || []) map[row.key] = row.value;
        return json(map);
      }
      if (method === 'PUT') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const body = await request.json();
        const records = [];
        for (const [key, value] of Object.entries(body)) {
          if (typeof key === 'string' && key.trim()) {
            records.push({
              key: key.trim(),
              value: value != null ? String(value) : '',
              updated_at: new Date().toISOString(),
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
        return json(map);
      }
    }

    // 3. File Upload (Native Cloudflare FormData)
    if (path === '/api/upload' && method === 'POST') {
      const user = await requireAuth(request, env);
      if (!user) return error('Unauthorized: Valid authentication required', 401);

      const contentType = request.headers.get('content-type') || '';
      if (!contentType.includes('multipart/form-data')) {
        return error('Content-Type must be multipart/form-data', 400);
      }

      const formData = await request.formData();
      const file = formData.get('file');
      const folder = (formData.get('folder') || 'uploads').toString().replace(/[^a-zA-Z0-9_-]/g, '');

      if (!file || typeof file === 'string') {
        return error('No file uploaded or invalid file format', 400);
      }

      const filename = (file.name || 'file').replace(/[^a-zA-Z0-9_.-]/g, '_');
      const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'mp4'];
      if (ext && !allowedExts.includes(ext)) {
        return error(`File type .${ext} is not supported.`, 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const uniqueKey = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${filename}`;
      const bucket = getEnv(env, 'SUPABASE_BUCKET_NAME') || 'ssmo-assets';

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(uniqueKey, arrayBuffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      if (uploadErr) {
        return error(`Supabase Storage Error: ${uploadErr.message}`, 500);
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uniqueKey);

      return json({
        success: true,
        url: urlData.publicUrl,
        key: uniqueKey,
        filename: file.name,
        size: arrayBuffer.byteLength,
        storage: 'supabase',
      }, 201);
    }

    // 4. File Redirect
    const fileMatch = path.match(/^\/api\/files\/(.+)$/);
    if (fileMatch && method === 'GET') {
      const key = decodeURIComponent(fileMatch[1]);
      const bucket = getEnv(env, 'SUPABASE_BUCKET_NAME') || 'ssmo-assets';
      const { data } = supabase.storage.from(bucket).getPublicUrl(key);
      return Response.redirect(data.publicUrl, 302);
    }

    // 5. Enquiries / Inquiries
    if (path === '/api/enquiries' || path === '/api/inquiries' || path === '/api/admin/enquiries' || path === '/api/admin/inquiries') {
      if (method === 'GET') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const { data, error: sbErr } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
        if (sbErr) throw sbErr;
        return json(data || []);
      }
      if (method === 'POST') {
        const body = await request.json();
        if (body._gotcha || body.website) return error('Automated submission rejected.', 400);
        const name = (body.name || '').trim();
        const email = (body.email || '').trim();
        const message = (body.message || '').trim();
        if (!name || !email || !message) {
          return error('Name, valid email, and message are required.', 400);
        }

        const id = generateId('enq');
        const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';

        const { data, error: sbErr } = await supabase.from('enquiries').insert({
          id,
          name,
          email,
          phone: (body.phone || '').trim(),
          subject: (body.subject || 'General Query').trim(),
          message,
          status: 'new',
          is_read: false,
          ip_address: ip,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).select().single();

        if (sbErr) throw sbErr;
        return json({ success: true, message: 'Enquiry submitted successfully', data }, 201);
      }
    }

    const enqReadMatch = path.match(/^\/api\/(?:admin\/)?(?:enquiries|inquiries)\/([^/]+)\/read$/);
    if (enqReadMatch && (method === 'PATCH' || method === 'PUT')) {
      const user = await requireAuth(request, env);
      if (!user) return error('Unauthorized: Valid authentication required', 401);
      const enqId = decodeURIComponent(enqReadMatch[1]);
      const { data, error: sbErr } = await supabase
        .from('enquiries')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', enqId)
        .select()
        .single();
      if (sbErr) throw sbErr;
      return json(data || { id: enqId });
    }

    const enqId = extractId(path, '/api/(?:admin/)?(?:enquiries|inquiries)');
    if (enqId) {
      const user = await requireAuth(request, env);
      if (!user) return error('Unauthorized: Valid authentication required', 401);
      if (method === 'GET') {
        const { data, error: sbErr } = await supabase.from('enquiries').select('*').eq('id', enqId).maybeSingle();
        if (sbErr) throw sbErr;
        if (!data) return error('Not found', 404);
        return json(data);
      }
      if (method === 'PATCH' || method === 'PUT') {
        const body = await request.json();
        const updateData = {};
        if (body.is_read !== undefined) updateData.is_read = !!body.is_read;
        if (body.status !== undefined) updateData.status = body.status;
        updateData.updated_at = new Date().toISOString();
        const { data, error: sbErr } = await supabase.from('enquiries').update(updateData).eq('id', enqId).select().single();
        if (sbErr) throw sbErr;
        return json(data || { id: enqId });
      }
      if (method === 'DELETE') {
        const { error: sbErr } = await supabase.from('enquiries').delete().eq('id', enqId);
        if (sbErr) throw sbErr;
        return json({ success: true, message: 'Deleted' });
      }
    }

    // 6. Announcements
    if (path === '/api/announcements' || path === '/api/admin/announcements') {
      if (method === 'GET') {
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const includeInactive = url.searchParams.get('includeInactive') === 'true';

        let query = supabase.from('announcements').select('*');
        if (!includeInactive) query = query.eq('is_active', true);
        if (category && category !== 'All') query = query.eq('category', category);
        if (search && search.trim()) {
          query = query.or(`title.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%`);
        }
        query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
        const { data, error: sbErr } = await query;
        if (sbErr) throw sbErr;
        return json(data || []);
      }
      if (method === 'POST') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const body = await request.json();
        const { title, link = '', content = '', category = 'Notices', badge = 'NEW', image_key = null, attachment_key = null, is_pinned = false, is_active = true } = body;
        if (!title || !title.trim()) return error('Title is required', 400);

        const id = generateId('ann');
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80);

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
          updated_at: new Date().toISOString(),
        }).select().single();

        if (sbErr) throw sbErr;
        return json(data, 201);
      }
    }

    const annId = extractId(path, '/api/(?:admin/)?announcements');
    if (annId) {
      if (method === 'GET') {
        const { data, error: sbErr } = await supabase.from('announcements').select('*').eq('id', annId).maybeSingle();
        if (sbErr) throw sbErr;
        if (!data) return error('Not found', 404);
        return json(data);
      }
      if (method === 'PUT' || method === 'PATCH') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const body = await request.json();
        const updateData = {};
        for (const [k, v] of Object.entries(body)) {
          if (['title', 'content', 'category', 'badge', 'link', 'image_key', 'attachment_key'].includes(k)) updateData[k] = v;
          if (k === 'is_pinned') updateData.is_pinned = !!v;
          if (k === 'is_active') updateData.is_active = v !== false && v !== 0;
        }
        updateData.updated_at = new Date().toISOString();
        const { data, error: sbErr } = await supabase.from('announcements').update(updateData).eq('id', annId).select().single();
        if (sbErr) throw sbErr;
        return json(data || { id: annId });
      }
      if (method === 'DELETE') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const { error: sbErr } = await supabase.from('announcements').delete().eq('id', annId);
        if (sbErr) throw sbErr;
        return json({ success: true, message: 'Deleted' });
      }
    }

    // 7. Achievements
    if (path === '/api/achievements' || path === '/api/admin/achievements') {
      if (method === 'GET') {
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const includeInactive = url.searchParams.get('includeInactive') === 'true';

        let query = supabase.from('achievements').select('*');
        if (!includeInactive) query = query.eq('is_active', true);
        if (category && category !== 'All') query = query.eq('category', category);
        if (search && search.trim()) {
          query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
        }
        query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
        const { data, error: sbErr } = await query;
        if (sbErr) throw sbErr;
        return json(data || []);
      }
      if (method === 'POST') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const body = await request.json();
        const { title, description = '', category = 'Academic', date = '', image_url = '', image_key = null, display_order = 0, is_active = true } = body;
        if (!title || !title.trim()) return error('Title is required', 400);

        const id = generateId('ach');
        const { data, error: sbErr } = await supabase.from('achievements').insert({
          id,
          title: title.trim(),
          description: description?.trim() || '',
          category,
          date: date || new Date().toISOString().split('T')[0],
          image_url: image_url?.trim() || '',
          image_key,
          display_order: Number(display_order) || 0,
          is_active: is_active !== false && is_active !== 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).select().single();

        if (sbErr) throw sbErr;
        return json(data, 201);
      }
    }

    const achId = extractId(path, '/api/(?:admin/)?achievements');
    if (achId) {
      if (method === 'GET') {
        const { data, error: sbErr } = await supabase.from('achievements').select('*').eq('id', achId).maybeSingle();
        if (sbErr) throw sbErr;
        if (!data) return error('Not found', 404);
        return json(data);
      }
      if (method === 'PUT' || method === 'PATCH') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const body = await request.json();
        const updateData = {};
        for (const [k, v] of Object.entries(body)) {
          if (['title', 'description', 'category', 'date', 'image_url', 'image_key'].includes(k)) updateData[k] = v;
          if (k === 'display_order') updateData.display_order = Number(v) || 0;
          if (k === 'is_active') updateData.is_active = v !== false && v !== 0;
        }
        updateData.updated_at = new Date().toISOString();
        const { data, error: sbErr } = await supabase.from('achievements').update(updateData).eq('id', achId).select().single();
        if (sbErr) throw sbErr;
        return json(data || { id: achId });
      }
      if (method === 'DELETE') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const { error: sbErr } = await supabase.from('achievements').delete().eq('id', achId);
        if (sbErr) throw sbErr;
        return json({ success: true, message: 'Deleted' });
      }
    }

    // 8. Gallery
    if (path === '/api/gallery' || path === '/api/admin/gallery') {
      if (method === 'GET') {
        const albumId = url.searchParams.get('album_id');
        const category = url.searchParams.get('category');
        let query = supabase.from('gallery_photos').select('*');
        if (albumId) query = query.eq('album_id', albumId);
        if (category && category !== 'All') query = query.eq('category', category);
        query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
        const { data, error: sbErr } = await query;
        if (sbErr) throw sbErr;
        return json(data || []);
      }
      if (method === 'POST') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const body = await request.json();
        const { title, image_url, image_key = null, category = 'Campus', description = '', album_id = null, display_order = 0, is_published = true } = body;
        if (!title || !title.trim()) return error('Photo title is required', 400);

        const id = generateId('gal');
        const { data, error: sbErr } = await supabase.from('gallery_photos').insert({
          id,
          title: title.trim(),
          image_url: image_url?.trim() || '',
          image_key,
          category,
          description: description?.trim() || '',
          album_id,
          display_order: Number(display_order) || 0,
          is_published: is_published !== false && is_published !== 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).select().single();

        if (sbErr) throw sbErr;
        return json(data, 201);
      }
    }

    const galId = extractId(path, '/api/(?:admin/)?gallery');
    if (galId) {
      if (method === 'GET') {
        const { data, error: sbErr } = await supabase.from('gallery_photos').select('*').eq('id', galId).maybeSingle();
        if (sbErr) throw sbErr;
        if (!data) return error('Not found', 404);
        return json(data);
      }
      if (method === 'PUT' || method === 'PATCH') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const body = await request.json();
        const updateData = {};
        for (const [k, v] of Object.entries(body)) {
          if (['title', 'category', 'image_url', 'image_key', 'description', 'album_id'].includes(k)) updateData[k] = v;
          if (k === 'display_order') updateData.display_order = Number(v) || 0;
          if (k === 'is_published') updateData.is_published = v !== false && v !== 0;
        }
        updateData.updated_at = new Date().toISOString();
        const { data, error: sbErr } = await supabase.from('gallery_photos').update(updateData).eq('id', galId).select().single();
        if (sbErr) throw sbErr;
        return json(data || { id: galId });
      }
      if (method === 'DELETE') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const { error: sbErr } = await supabase.from('gallery_photos').delete().eq('id', galId);
        if (sbErr) throw sbErr;
        return json({ success: true, message: 'Deleted' });
      }
    }

    // 9. Faculties
    if (path === '/api/faculties' || path === '/api/admin/faculties') {
      if (method === 'GET') {
        const department = url.searchParams.get('department');
        const search = url.searchParams.get('search');
        const includeInactive = url.searchParams.get('includeInactive') === 'true';

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
          if (!sbErr && data) return json(data);
        } catch {}

        list = await getFacultiesHelper(supabase);
        if (!includeInactive) list = list.filter(f => f.is_active !== false && f.is_active !== 0);
        if (department && department !== 'All') list = list.filter(f => f.department === department);
        if (search && search.trim()) {
          const q = search.trim().toLowerCase();
          list = list.filter(f => (f.name && f.name.toLowerCase().includes(q)) || (f.designation && f.designation.toLowerCase().includes(q)));
        }
        list.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
        return json(list);
      }
      if (method === 'POST') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const body = await request.json();
        const { name, department = '', designation = '', qualification = '', expertise = '', image_url = '', image_key = null, display_order = 0, is_active = true } = body;
        if (!name || !name.trim()) return error('Faculty name is required', 400);

        const id = generateId('fac');
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
          updated_at: new Date().toISOString(),
        };

        try {
          const { data, error: sbErr } = await supabase.from('faculties').insert(newFaculty).select().single();
          if (!sbErr && data) return json(data, 201);
        } catch {}

        return json(newFaculty, 201);
      }
    }

    const facId = extractId(path, '/api/(?:admin/)?faculties');
    if (facId) {
      if (method === 'GET') {
        try {
          const { data, error: sbErr } = await supabase.from('faculties').select('*').eq('id', facId).maybeSingle();
          if (!sbErr && data) return json(data);
        } catch {}
        const list = await getFacultiesHelper(supabase);
        const item = list.find(f => f.id === facId);
        if (!item) return error('Faculty member not found', 404);
        return json(item);
      }
      if (method === 'PUT' || method === 'PATCH') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        const body = await request.json();
        const updateData = {};
        for (const [k, v] of Object.entries(body)) {
          if (['name', 'designation', 'qualification', 'expertise', 'department', 'image_url', 'image_key', 'email', 'phone'].includes(k)) updateData[k] = v;
          if (k === 'display_order') updateData.display_order = Number(v) || 0;
          if (k === 'is_active') updateData.is_active = v !== false && v !== 0;
        }
        updateData.updated_at = new Date().toISOString();
        try {
          const { data, error: sbErr } = await supabase.from('faculties').update(updateData).eq('id', facId).select().single();
          if (!sbErr && data) return json(data);
        } catch {}
        return json({ id: facId, ...updateData });
      }
      if (method === 'DELETE') {
        const user = await requireAuth(request, env);
        if (!user) return error('Unauthorized: Valid authentication required', 401);
        try {
          await supabase.from('faculties').delete().eq('id', facId);
        } catch {}
        return json({ success: true, message: 'Deleted' });
      }
    }

    return error(`Route not found: ${method} ${path}`, 404);
  } catch (err) {
    console.error(`API Error [${method} ${path}]:`, err);
    return error(err.message || 'Internal Server Error', 500);
  }
}

// ─── Cloudflare Worker Main Entry ────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // If it's an API route, handle with Supabase backend router
    if (url.pathname.startsWith('/api')) {
      return await handleApiRequest(request, env);
    }

    // Serve static assets from Vite build with SPA fallback
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
