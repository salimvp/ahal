import { d1Query } from '../_lib/d1.js';
import { requireAuth } from '../_lib/auth.js';
import { deleteFromR2 } from '../_lib/r2.js';
import { json, error, parseBody } from '../_lib/response.js';

export default async function handler(req, res) {
  // Extract id from URL
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathParts = url.pathname.split('/');
  const id = req.query?.id || pathParts[pathParts.length - 1];

  if (!id) {
    return error(res, 'Announcement ID is required', 400);
  }

  // GET: Single announcement
  if (req.method === 'GET') {
    try {
      const { results } = await d1Query('SELECT * FROM announcements WHERE id = ?', [id]);
      if (!results || results.length === 0) {
        return error(res, 'Announcement not found', 404);
      }
      return json(res, results[0]);
    } catch (err) {
      return error(res, err.message || 'Failed to retrieve announcement', 500);
    }
  }

  // PUT: Admin update announcement
  if (req.method === 'PUT') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const body = await parseBody(req);
      const {
        title,
        link,
        content,
        category,
        badge,
        image_key,
        attachment_key,
        is_pinned,
        is_active
      } = body;

      const { results: existing } = await d1Query('SELECT * FROM announcements WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return error(res, 'Announcement not found', 404);
      }
      const current = existing[0];

      const updatedTitle = title !== undefined ? title.trim() : current.title;
      const updatedLink = link !== undefined ? link.trim() : current.link;
      const updatedContent = content !== undefined ? content.trim() : current.content;
      const updatedCategory = category !== undefined ? category : current.category;
      const updatedBadge = badge !== undefined ? badge : current.badge;
      const updatedImageKey = image_key !== undefined ? image_key : current.image_key;
      const updatedAttachmentKey = attachment_key !== undefined ? attachment_key : current.attachment_key;
      const updatedPinned = is_pinned !== undefined ? (is_pinned ? 1 : 0) : current.is_pinned;
      const updatedActive = is_active !== undefined ? (is_active ? 1 : 0) : current.is_active;

      await d1Query(
        `UPDATE announcements SET
          title = ?,
          link = ?,
          content = ?,
          category = ?,
          badge = ?,
          image_key = ?,
          attachment_key = ?,
          is_pinned = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedTitle,
          updatedLink,
          updatedContent,
          updatedCategory,
          updatedBadge,
          updatedImageKey,
          updatedAttachmentKey,
          updatedPinned,
          updatedActive,
          id
        ]
      );

      const { results: updated } = await d1Query('SELECT * FROM announcements WHERE id = ?', [id]);
      return json(res, updated?.[0] || { id, success: true });
    } catch (err) {
      return error(res, err.message || 'Failed to update announcement', 500);
    }
  }

  // DELETE: Admin delete announcement with R2 cleanup
  if (req.method === 'DELETE') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const { results } = await d1Query('SELECT * FROM announcements WHERE id = ?', [id]);
      if (!results || results.length === 0) {
        return error(res, 'Announcement not found', 404);
      }
      const item = results[0];

      // Cleanup associated files in R2
      if (item.image_key) {
        await deleteFromR2(item.image_key);
      }
      if (item.attachment_key) {
        await deleteFromR2(item.attachment_key);
      }

      await d1Query('DELETE FROM announcements WHERE id = ?', [id]);
      return json(res, { success: true, message: 'Announcement deleted successfully' });
    } catch (err) {
      return error(res, err.message || 'Failed to delete announcement', 500);
    }
  }

  return error(res, 'Method not allowed', 405);
}
