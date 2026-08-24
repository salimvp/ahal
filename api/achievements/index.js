import { d1Query } from '../_lib/d1.js';
import { requireAuth } from '../_lib/auth.js';
import { json, error, parseBody } from '../_lib/response.js';
import crypto from 'node:crypto';

export default async function handler(req, res) {
  // GET: Public list of achievements
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const category = url.searchParams.get('category');

      let sql = 'SELECT * FROM achievements WHERE is_published = 1';
      const params = [];

      if (category && category !== 'All') {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY display_order ASC, created_at DESC';

      const { results } = await d1Query(sql, params);
      return json(res, results || []);
    } catch (err) {
      return error(res, err.message || 'Failed to retrieve achievements', 500);
    }
  }

  // POST: Admin create achievement
  if (req.method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const body = await parseBody(req);
      const {
        title,
        subtitle = '',
        description = '',
        category = 'Academic',
        year = '2026',
        image_url = '',
        image_key = null,
        rank_badge = '',
        display_order = 0,
        is_published = 1
      } = body;

      if (!title || !title.trim()) {
        return error(res, 'Milestone title is required', 400);
      }

      const id = `ach-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

      await d1Query(
        `INSERT INTO achievements (
          id, title, subtitle, description, category,
          year, image_url, image_key, rank_badge,
          display_order, is_published, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          id,
          title.trim(),
          subtitle ? subtitle.trim() : '',
          description ? description.trim() : '',
          category,
          year,
          image_url,
          image_key,
          rank_badge,
          Number(display_order) || 0,
          is_published ? 1 : 0
        ]
      );

      const { results } = await d1Query('SELECT * FROM achievements WHERE id = ?', [id]);
      return json(res, results?.[0] || { id, title }, 201);
    } catch (err) {
      return error(res, err.message || 'Failed to create achievement', 500);
    }
  }

  return error(res, 'Method not allowed', 405);
}
