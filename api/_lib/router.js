/**
 * Unified API Router for local dev server and tests
 */

import loginHandler from '../auth/login.js';
import verifyHandler from '../auth/verify.js';
import changePasswordHandler from '../auth/change-password.js';
import announcementsIndex from '../announcements/index.js';
import announcementsId from '../announcements/[id].js';
import achievementsIndex from '../achievements/index.js';
import achievementsId from '../achievements/[id].js';
import galleryIndex from '../gallery/index.js';
import galleryId from '../gallery/[id].js';
import inquiriesIndex from '../inquiries/index.js';
import inquiriesId from '../inquiries/[id].js';
import inquiriesRead from '../inquiries/[id]/read.js';
import settingsHandler from '../settings.js';
import uploadHandler from '../upload.js';
import filesHandler from '../files/[key].js';

export async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  // 1. Auth routes
  if (pathname === '/api/auth/login') {
    return loginHandler(req, res);
  }
  if (pathname === '/api/auth/verify') {
    return verifyHandler(req, res);
  }
  if (pathname === '/api/auth/change-password') {
    return changePasswordHandler(req, res);
  }

  // 2. Announcements
  if (pathname === '/api/announcements' || pathname === '/api/admin/announcements') {
    return announcementsIndex(req, res);
  }
  const annMatch = pathname.match(/^\/api\/(?:admin\/)?announcements\/([^/]+)$/);
  if (annMatch) {
    req.query = { ...(req.query || {}), id: decodeURIComponent(annMatch[1]) };
    return announcementsId(req, res);
  }

  // 3. Achievements
  if (pathname === '/api/achievements' || pathname === '/api/admin/achievements') {
    return achievementsIndex(req, res);
  }
  const achMatch = pathname.match(/^\/api\/(?:admin\/)?achievements\/([^/]+)$/);
  if (achMatch) {
    req.query = { ...(req.query || {}), id: decodeURIComponent(achMatch[1]) };
    return achievementsId(req, res);
  }

  // 4. Gallery
  if (pathname === '/api/gallery' || pathname === '/api/admin/gallery') {
    return galleryIndex(req, res);
  }
  const galMatch = pathname.match(/^\/api\/(?:admin\/)?gallery\/([^/]+)$/);
  if (galMatch) {
    req.query = { ...(req.query || {}), id: decodeURIComponent(galMatch[1]) };
    return galleryId(req, res);
  }

  // 5. Inquiries & Enquiries
  if (pathname === '/api/inquiries' || pathname === '/api/enquiries' || pathname === '/api/admin/enquiries') {
    return inquiriesIndex(req, res);
  }
  const inqReadMatch = pathname.match(/^\/api\/(?:admin\/)?(?:inquiries|enquiries)\/([^/]+)\/read$/);
  if (inqReadMatch) {
    req.query = { ...(req.query || {}), id: decodeURIComponent(inqReadMatch[1]) };
    return inquiriesRead(req, res);
  }
  const inqMatch = pathname.match(/^\/api\/(?:admin\/)?(?:inquiries|enquiries)\/([^/]+)$/);
  if (inqMatch) {
    req.query = { ...(req.query || {}), id: decodeURIComponent(inqMatch[1]) };
    return inquiriesId(req, res);
  }

  // 6. Settings
  if (pathname === '/api/settings') {
    return settingsHandler(req, res);
  }

  // 7. Upload
  if (pathname === '/api/upload') {
    return uploadHandler(req, res);
  }

  // 8. Files proxy
  const fileMatch = pathname.match(/^\/api\/files\/(.+)$/);
  if (fileMatch) {
    req.query = { ...(req.query || {}), key: decodeURIComponent(fileMatch[1]) };
    return filesHandler(req, res);
  }

  // Not Found
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: `API route not found: ${pathname}` }));
}
