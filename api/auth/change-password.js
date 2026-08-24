import { requireAuth, updateAdminPassword } from '../_lib/auth.js';
import { json, error, parseBody } from '../_lib/response.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return error(res, 'Method not allowed', 405);
  }

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const body = await parseBody(req);
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return error(res, 'Current password and new password are required', 400);
    }

    const result = await updateAdminPassword(user.username, currentPassword, newPassword);
    return json(res, result);
  } catch (err) {
    return error(res, err.message || 'Password update failed', 400);
  }
}
