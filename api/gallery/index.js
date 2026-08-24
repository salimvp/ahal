import { d1Query } from '../_lib/d1.js';
import { requireAuth } from '../_lib/auth.js';
import { json, error, parseBody } from '../_lib/response.js';
import crypto from 'node:crypto';

export default async function handler(req, res) {
  // GET: Public list of gallery photos
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const category = url.searchParams.get('category');
      const limit = parseInt(url.searchParams.get('limit'), 10);

      let sql = 'SELECT * FROM gallery_photos WHERE is_published = 1';
      const params = [];

      if (category && category !== 'All') {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY display_order ASC, created_at DESC';

      if (limit && !isNaN(limit) && limit > 0) {
        sql += ' LIMIT ?';
        params.push(limit);
      }

      const { results } = await d1Query(sql, params);
      return json(res, results || []);
    } catch (err) {
      return error(res, err.message || 'Failed to retrieve gallery photos', 500);
    }
  }

  // POST: Admin add photo to archive
  if (req.method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const body = await parseBody(req);
      const {
        title,
        category = 'Campus',
        image_url,
        image_key = null,
        description = '',
        album_id = null,
        display_order = 0,
        is_published = 1
      } = body;

      if (!title || !title.trim()) {
        return error(res, 'Photo caption/title is required', 400);
      }

      if (!image_url || !image_url.trim()) {
        return error(res, 'Image URL or file is required', 400);
      }

      const id = `gal-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

      await d1Query(
        `INSERT INTO gallery_photos (
          id, album_id, title, category, image_url, image_key,
          description, display_order, is_published, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          id,
          album_id,
          title.trim(),
          category,
          image_url.trim(),
          image_key,
          description ? description.trim() : '',
          Number(display_order) || 0,
          is_published ? 1 : 0
        ]
      );

      const { results } = await d1Query('SELECT * FROM gallery_photos WHERE id = ?', [id]);
      return json(res, results?.[0] || { id, title }, 201);
    } catch (err) {
      return error(res, err.message || 'Failed to add gallery photo', 500);
    }
  }

  return error(res, 'Method not allowed', 405);
}
