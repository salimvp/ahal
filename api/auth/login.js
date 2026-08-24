import { authenticateAdmin, generateToken } from '../_lib/auth.js';
import { json, error, parseBody } from '../_lib/response.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return error(res, 'Method not allowed', 405);
  }

  try {
    const body = await parseBody(req);
    const { username, password } = body;

    const user = await authenticateAdmin(username, password);
    const token = generateToken(user);

    return json(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    return error(res, err.message || 'Authentication failed', 401);
  }
}
