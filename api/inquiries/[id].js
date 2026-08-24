import { d1Query } from '../_lib/d1.js';
import { requireAuth } from '../_lib/auth.js';
import { json, error, parseBody } from '../_lib/response.js';

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathParts = url.pathname.split('/');
  const id = req.query?.id || pathParts[pathParts.length - 1];

  if (!id) {
    return error(res, 'Inquiry ID is required', 400);
  }

  const user = requireAuth(req, res);
  if (!user) return;

  // GET: Single inquiry
  if (req.method === 'GET') {
    try {
      const { results } = await d1Query('SELECT * FROM enquiries WHERE id = ?', [id]);
      if (!results || results.length === 0) {
        return error(res, 'Inquiry not found', 404);
      }
      return json(res, results[0]);
    } catch (err) {
      return error(res, err.message || 'Failed to retrieve inquiry', 500);
    }
  }

  // PUT: Update inquiry status (read, replied, archived)
  if (req.method === 'PUT') {
    try {
      const body = await parseBody(req);
      const { status = 'read', is_read } = body;

      const isReadVal = is_read !== undefined ? (is_read ? 1 : 0) : (status === 'read' || status === 'replied' ? 1 : 0);

      await d1Query(
        `UPDATE enquiries SET
          status = ?,
          is_read = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [status, isReadVal, id]
      );

      const { results } = await d1Query('SELECT * FROM enquiries WHERE id = ?', [id]);
      return json(res, results?.[0] || { id, status, success: true });
    } catch (err) {
      return error(res, err.message || 'Failed to update inquiry', 500);
    }
  }

  // DELETE: Delete inquiry
  if (req.method === 'DELETE') {
    try {
      await d1Query('DELETE FROM enquiries WHERE id = ?', [id]);
      return json(res, { success: true, message: 'Inquiry deleted successfully' });
    } catch (err) {
      return error(res, err.message || 'Failed to delete inquiry', 500);
    }
  }

  return error(res, 'Method not allowed', 405);
}
