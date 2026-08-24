import { d1Query } from '../_lib/d1.js';
import { requireAuth } from '../_lib/auth.js';
import { json, error, parseBody } from '../_lib/response.js';
import crypto from 'node:crypto';

export default async function handler(req, res) {
  // GET: Public list of announcements
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      const includeInactive = url.searchParams.get('includeInactive') === 'true';

      let sql = 'SELECT * FROM announcements WHERE 1=1';
      const params = [];

      if (!includeInactive) {
        sql += ' AND is_active = 1';
      }

      if (category && category !== 'All') {
        sql += ' AND category = ?';
        params.push(category);
      }

      if (search && search.trim()) {
        sql += ' AND (title LIKE ? OR content LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term);
      }

      sql += ' ORDER BY is_pinned DESC, created_at DESC';

      const { results } = await d1Query(sql, params);
      return json(res, results || []);
    } catch (err) {
      return error(res, err.message || 'Failed to retrieve announcements', 500);
    }
  }

  // POST: Admin create announcement
  if (req.method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const body = await parseBody(req);
      const {
        title,
        link = '',
        content = '',
        category = 'Notices',
        badge = 'NEW',
        image_key = null,
        attachment_key = null,
        is_pinned = false,
        is_active = true
      } = body;

      if (!title || !title.trim()) {
        return error(res, 'Notice title is required', 400);
      }

      const id = `ann-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 80);

      await d1Query(
        `INSERT INTO announcements (
          id, title, slug, content, category, badge, link,
          image_key, attachment_key, is_pinned, is_active,
          published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          id,
          title.trim(),
          slug,
          content ? content.trim() : '',
          category,
          badge,
          link ? link.trim() : '',
          image_key,
          attachment_key,
          is_pinned ? 1 : 0,
          is_active ? 1 : 0
        ]
      );

      const { results } = await d1Query('SELECT * FROM announcements WHERE id = ?', [id]);
      return json(res, results?.[0] || { id, title }, 201);
    } catch (err) {
      return error(res, err.message || 'Failed to create announcement', 500);
    }
  }

  return error(res, 'Method not allowed', 405);
}
