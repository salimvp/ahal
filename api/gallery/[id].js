import { d1Query } from '../_lib/d1.js';
import { requireAuth } from '../_lib/auth.js';
import { deleteFromR2 } from '../_lib/r2.js';
import { json, error, parseBody } from '../_lib/response.js';

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathParts = url.pathname.split('/');
  const id = req.query?.id || pathParts[pathParts.length - 1];

  if (!id) {
    return error(res, 'Gallery item ID is required', 400);
  }

  // GET: Single photo item
  if (req.method === 'GET') {
    try {
      const { results } = await d1Query('SELECT * FROM gallery_photos WHERE id = ?', [id]);
      if (!results || results.length === 0) {
        return error(res, 'Gallery item not found', 404);
      }
      return json(res, results[0]);
    } catch (err) {
      return error(res, err.message || 'Failed to retrieve gallery item', 500);
    }
  }

  // PUT: Admin update photo
  if (req.method === 'PUT') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const body = await parseBody(req);
      const {
        title,
        category,
        image_url,
        image_key,
        description,
        album_id,
        display_order,
        is_published
      } = body;

      const { results: existing } = await d1Query('SELECT * FROM gallery_photos WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return error(res, 'Gallery item not found', 404);
      }
      const current = existing[0];

      const updatedTitle = title !== undefined ? title.trim() : current.title;
      const updatedCategory = category !== undefined ? category : current.category;
      const updatedImageUrl = image_url !== undefined ? image_url : current.image_url;
      const updatedImageKey = image_key !== undefined ? image_key : current.image_key;
      const updatedDesc = description !== undefined ? description.trim() : current.description;
      const updatedAlbumId = album_id !== undefined ? album_id : current.album_id;
      const updatedOrder = display_order !== undefined ? Number(display_order) : current.display_order;
      const updatedPublished = is_published !== undefined ? (is_published ? 1 : 0) : current.is_published;

      await d1Query(
        `UPDATE gallery_photos SET
          title = ?,
          category = ?,
          image_url = ?,
          image_key = ?,
          description = ?,
          album_id = ?,
          display_order = ?,
          is_published = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedTitle,
          updatedCategory,
          updatedImageUrl,
          updatedImageKey,
          updatedDesc,
          updatedAlbumId,
          updatedOrder,
          updatedPublished,
          id
        ]
      );

      const { results: updated } = await d1Query('SELECT * FROM gallery_photos WHERE id = ?', [id]);
      return json(res, updated?.[0] || { id, success: true });
    } catch (err) {
      return error(res, err.message || 'Failed to update gallery photo', 500);
    }
  }

  // DELETE: Admin delete photo with R2 cleanup
  if (req.method === 'DELETE') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { results } = await d1Query('SELECT * FROM gallery_photos WHERE id = ?', [id]);
      if (!results || results.length === 0) {
        return error(res, 'Gallery item not found', 404);
      }
      const item = results[0];

      // Delete associated image in R2
      if (item.image_key) {
        await deleteFromR2(item.image_key);
      }

      await d1Query('DELETE FROM gallery_photos WHERE id = ?', [id]);
      return json(res, { success: true, message: 'Gallery item deleted successfully' });
    } catch (err) {
      return error(res, err.message || 'Failed to delete gallery item', 500);
    }
  }

  return error(res, 'Method not allowed', 405);
}
