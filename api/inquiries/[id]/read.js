import { d1Query } from '../../_lib/d1.js';
import { requireAuth } from '../../_lib/auth.js';
import { json, error } from '../../_lib/response.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return error(res, 'Method not allowed', 405);
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const parts = url.pathname.split('/').filter(Boolean);
  // URL pattern: /api/inquiries/:id/read -> parts: ['api', 'inquiries', ':id', 'read']
  const id = req.query?.id || (parts.length >= 2 ? parts[parts.length - 2] : null);

  if (!id) {
    return error(res, 'Inquiry ID is required', 400);
  }

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    await d1Query(
      `UPDATE enquiries SET
        is_read = 1,
        status = 'read',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [id]
    );

    const { results } = await d1Query('SELECT * FROM enquiries WHERE id = ?', [id]);
    return json(res, results?.[0] || { id, is_read: 1, success: true });
  } catch (err) {
    return error(res, err.message || 'Failed to mark inquiry as read', 500);
  }
}
