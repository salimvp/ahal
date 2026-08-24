import { d1Query } from '../_lib/d1.js';
import { requireAuth } from '../_lib/auth.js';
import { validateEnquiryInput, checkRateLimit, getClientIp } from '../_lib/security.js';
import { json, error, parseBody } from '../_lib/response.js';
import crypto from 'node:crypto';

export default async function handler(req, res) {
  // GET: Admin fetch inquiries
  if (req.method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const search = url.searchParams.get('search');
      const status = url.searchParams.get('status');

      let sql = 'SELECT * FROM enquiries WHERE 1=1';
      const params = [];

      if (status && status !== 'All') {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (search && search.trim()) {
        sql += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ? OR subject LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term, term);
      }

      sql += ' ORDER BY created_at DESC';

      const { results } = await d1Query(sql, params);
      return json(res, results || []);
    } catch (err) {
      return error(res, err.message || 'Failed to fetch inquiries', 500);
    }
  }

  // POST: Public submit inquiry form
  if (req.method === 'POST') {
    try {
      const ip = getClientIp(req);

      // Check Rate Limit (max 5 per minute per IP)
      if (!checkRateLimit(ip)) {
        return error(res, 'Too many requests. Please wait a moment before sending another message.', 429);
      }

      const body = await parseBody(req);
      const sanitized = validateEnquiryInput(body);

      const id = `inq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

      await d1Query(
        `INSERT INTO enquiries (
          id, name, email, phone, subject, message,
          status, is_read, ip_address, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'new', 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          id,
          sanitized.name,
          sanitized.email,
          sanitized.phone || '',
          sanitized.subject || 'General Query',
          sanitized.message,
          ip
        ]
      );

      return json(res, {
        success: true,
        message: 'Your inquiry has been submitted successfully. Our admissions desk will respond shortly.',
        id
      }, 201);
    } catch (err) {
      return error(res, err.message || 'Failed to submit inquiry', 400);
    }
  }

  return error(res, 'Method not allowed', 405);
}
