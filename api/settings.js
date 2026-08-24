import { d1Query } from './_lib/d1.js';
import { requireAuth } from './_lib/auth.js';
import { json, error, parseBody } from './_lib/response.js';

export default async function handler(req, res) {
  // GET: Public settings map
  if (req.method === 'GET') {
    try {
      const { results } = await d1Query('SELECT key, value FROM settings');
      const settingsMap = {};
      if (results) {
        for (const row of results) {
          settingsMap[row.key] = row.value;
        }
      }
      return json(res, settingsMap);
    } catch (err) {
      return error(res, err.message || 'Failed to retrieve settings', 500);
    }
  }

  // PUT: Admin update settings map
  if (req.method === 'PUT') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const body = await parseBody(req);
      if (!body || typeof body !== 'object') {
        return error(res, 'Invalid settings payload', 400);
      }

      for (const [key, value] of Object.entries(body)) {
        if (typeof key === 'string' && key.trim()) {
          const stringVal = value !== null && value !== undefined ? String(value) : '';
          await d1Query(
            `INSERT INTO settings (key, value, updated_at)
             VALUES (?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(key) DO UPDATE SET
               value = excluded.value,
               updated_at = CURRENT_TIMESTAMP`,
            [key.trim(), stringVal]
          );
        }
      }

      const { results } = await d1Query('SELECT key, value FROM settings');
      const settingsMap = {};
      if (results) {
        for (const row of results) {
          settingsMap[row.key] = row.value;
        }
      }
      return json(res, settingsMap);
    } catch (err) {
      return error(res, err.message || 'Failed to update settings', 500);
    }
  }

  return error(res, 'Method not allowed', 405);
}
