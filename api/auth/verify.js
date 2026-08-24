import { requireAuth } from '../_lib/auth.js';
import { json, error } from '../_lib/response.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return error(res, 'Method not allowed', 405);
  }

  const user = requireAuth(req, res);
  if (!user) return;

  return json(res, {
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
}
