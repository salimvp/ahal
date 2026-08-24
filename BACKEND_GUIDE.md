# Supabase Backend Architecture & Integration Guide

This guide explains the backend architecture for the **SSMO Institute of Teacher Education** website and admin management system.

---

## 1. Architecture Overview

* **Frontend:** React + Vite + Tailwind CSS.
* **Backend Runtime:** Vercel Serverless Functions (`/api/*`) + Local Vite dev API middleware.
* **Database:** **Supabase PostgreSQL** (managed PostgreSQL with Row Level Security).
* **File Storage:** **Supabase Storage** (public bucket: `ssmo-assets`).
* **Authentication:** **Supabase Auth** (JWT / secure sessions with role-based access).
* **Deployment:** Vercel (Hobby Free Tier) / Supabase Free Tier.
* **Total Cost:** **₹0 / $0 per month (Free Tier)**.

---

## 2. Supabase Configuration

### Environment Variables (`.env`)

```ini
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET_NAME=ssmo-assets
```

---

## 3. Database Schema & Tables

The database schema is defined in [`supabase/schema.sql`](supabase/schema.sql) and includes:

1. **`announcements`** — Bulletin notices, circulars, categories, badge tags, pinned status, attachments.
2. **`achievements`** — College accomplishments, awards, year, badges, images.
3. **`gallery_photos`** — Campus and event photos, categories, display order.
4. **`gallery_albums`** — Categorized photo collections.
5. **`enquiries`** — Contact form submissions with rate limiting & anti-spam protections.
6. **`settings`** — Site configuration key-value pairs (contact details, messages, principal info).
7. **`admins`** — Admin records (managed via Supabase Auth).

---

## 4. API Endpoints

All backend routes are served through the unified API router (`/api/*`):

| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/announcements` | List public notices & circulars | No |
| `POST` | `/api/announcements` | Create a new circular | Yes |
| `GET` | `/api/announcements/:id` | Get circular details | No |
| `PUT` | `/api/announcements/:id` | Update circular | Yes |
| `DELETE` | `/api/announcements/:id` | Delete circular | Yes |
| `GET` | `/api/achievements` | List achievements | No |
| `POST` | `/api/achievements` | Create achievement | Yes |
| `PUT` | `/api/achievements/:id` | Update achievement | Yes |
| `DELETE` | `/api/achievements/:id` | Delete achievement | Yes |
| `GET` | `/api/gallery` | List gallery photos | No |
| `POST` | `/api/gallery` | Add gallery photo | Yes |
| `PUT` | `/api/gallery/:id` | Update gallery photo | Yes |
| `DELETE` | `/api/gallery/:id` | Delete gallery photo | Yes |
| `POST` | `/api/enquiries` | Submit contact enquiry | No (Rate limited) |
| `GET` | `/api/admin/enquiries` | View all enquiries | Yes |
| `PUT` | `/api/enquiries/:id/read` | Mark enquiry as read | Yes |
| `DELETE` | `/api/enquiries/:id` | Delete enquiry | Yes |
| `GET` | `/api/settings` | Get site settings | No |
| `PUT` | `/api/settings` | Update site settings | Yes |
| `POST` | `/api/upload` | Upload file to Supabase Storage | Yes |

---

## 5. Health Check & Verification

Run the verification script to test connection to Supabase database tables and storage bucket:

```bash
npm run db:migrate
```

---

## 6. Local Development

```bash
npm run dev
```

* The Vite dev server will run at `http://localhost:5173`.
* Vite dev API server handles `/api/*` requests directly through `api/_lib/router.js` connecting to Supabase.


---

## 7. Vercel Deployment

1. Push the code to your GitHub repository.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `SUPABASE_BUCKET_NAME` (`ssmo-assets`)
5. Click **Deploy**.

---

## 8. Summary

* **Database & Auth & Storage:** 100% managed by **Supabase**.
* **Zero Cloudflare dependencies:** All data and files are stored and managed via Supabase.


## 8. Security & Clean Deletion Guarantees

1. **Upload Security:** Server-side MIME type verification, extension verification, file size enforcement (max 25MB), and cryptographic random key generation.
2. **Orphaned File Cleanup:** Deleting an announcement, achievement, or gallery photo automatically deletes its corresponding object from Supabase Storage.
3. **Anti-Spam Protections:** Inquiry submissions are protected with hidden honeypot validation, input sanitization, and sliding-window IP rate limiting (max 5 submissions per minute).
4. **Credential Security:** Admin passwords are encrypted using PBKDF2 with SHA-512 and unique salts. No plain text passwords are ever stored.
