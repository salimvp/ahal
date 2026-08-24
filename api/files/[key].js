import { getFromR2 } from '../_lib/r2.js';
import { error } from '../_lib/response.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return error(res, 'Method not allowed', 405);
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const key = req.query?.key || url.pathname.replace(/^\/api\/files\/?/, '');

  if (!key) {
    return error(res, 'File key is required', 400);
  }

  try {
    const file = await getFromR2(decodeURIComponent(key));
    if (!file || !file.body) {
      return error(res, 'File not found', 404);
    }

    if (file.contentType) {
      res.setHeader('Content-Type', file.contentType);
    }
    if (file.contentLength) {
      res.setHeader('Content-Length', file.contentLength);
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Pipe the stream to response
    if (typeof file.body.pipe === 'function') {
      file.body.pipe(res);
    } else if (typeof file.body.transformToByteArray === 'function') {
      const byteArray = await file.body.transformToByteArray();
      res.end(Buffer.from(byteArray));
    } else {
      res.end(file.body);
    }
  } catch (err) {
    return error(res, err.message || 'Failed to serve file', 500);
  }
}
