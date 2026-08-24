# Cloudflare D1 & R2 Backend Integration Guide (₹0/Month Free Tier)

This guide explains the backend architecture for the **SSMO Institute of Teacher Education** website and admin management system.

---

## 1. Architecture Overview

* **Frontend:** React + Vite + Tailwind CSS (Preserved existing design).
* **Backend Runtime:** Vercel Serverless Functions (`/api/*`).
* **Database:** **Cloudflare D1** (Serverless SQLite).
  * *Free Tier Allowance:* 5,000,000 read queries/day, 100,000 write queries/day.
* **File Storage:** **Cloudflare R2** (S3-compatible Object Storage).
  * *Free Tier Allowance:* 10 GB storage, 1,000,000 Class A operations/month, 10,000,000 Class B operations/month, $0 egress fees.
* **Deployment:** Vercel (Hobby Free Tier).
* **Total Running Cost:** **₹0 / $0 per month**.

---

## 2. Quick Setup Instructions

### Step 1: Create Cloudflare D1 Database

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, go to **Storage & Databases** > **D1**.
3. Click **Create Database**, name it `ssmo-database`, and click **Create**.
4. Note your:
   * **Account ID** (found in your Cloudflare dashboard URL or Overview sidebar).
   * **Database ID** (UUID shown on the D1 database page).

### Step 2: Create Cloudflare R2 Storage Bucket

1. In the Cloudflare Dashboard, go to **Storage & Databases** > **R2**.
2. Click **Create Bucket**, name it `ssmo-assets`, and select **Create Bucket**.
3. Under **Bucket Settings**:
   * *(Optional)* Enable **R2.dev subdomain** or connect a Custom Domain if you want direct public CDN image URLs.
4. In the R2 overview page, click **Manage R2 API Tokens** > **Create API Token**:
   * Permissions: **Object Read & Write**
   * Specify bucket: `ssmo-assets`
   * Click **Create API Token** and copy the **Access Key ID** and **Secret Access Key**.

### Step 3: Create Cloudflare API Token for D1

1. Go to **My Profile** > **API Tokens** > **Create Token**.
2. Select **Create Custom Token**:
   * Token name: `D1-API-Access`
   * Permissions:
     * `Account` > `D1` > `Edit`
   * Account Resources: `Include` > `All accounts` (or your specific account).
3. Click **Continue to summary** > **Create Token**, and copy the token.

---

## 3. Configure Environment Variables

Create `.env` in the project root (or configure in Vercel Project Settings):

```ini
# Cloudflare D1
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_D1_DATABASE_ID=your_d1_database_uuid
CF_API_TOKEN=your_cloudflare_api_token

# Cloudflare R2
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=ssmo-assets
R2_PUBLIC_URL=

# Admin Authentication
ADMIN_JWT_SECRET=generate_a_random_32_char_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ssmo@admin2026
```

---

## 4. Run Database Migrations

Run the database migration script to create all tables (`announcements`, `gallery_albums`, `gallery_photos`, `achievements`, `enquiries`, `settings`, `admins`) and seed default data:

```bash
npm run db:migrate
```

* When Cloudflare credentials are set in `.env`, the script runs directly against your Cloudflare D1 instance via the Cloudflare REST API.
* When working offline without Cloudflare credentials, the script automatically uses a local SQLite fallback (`.data/local-d1.sqlite`).

---

## 5. Local Development

Start the development server:

```bash
npm run dev
```

* The Vite dev server includes an integrated API middleware that seamlessly executes backend API routes and simulates Cloudflare D1/R2 locally.
* Test suite: Run `node scripts/test-api.js` to execute automated integration tests against all API endpoints.

---

## 6. Vercel Deployment

1. Push the code to your GitHub repository.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   * `CF_ACCOUNT_ID`
   * `CF_D1_DATABASE_ID`
   * `CF_API_TOKEN`
   * `R2_ACCESS_KEY_ID`
   * `R2_SECRET_ACCESS_KEY`
   * `R2_BUCKET_NAME`
   * `R2_PUBLIC_URL` (optional)
   * `ADMIN_JWT_SECRET`
   * `ADMIN_USERNAME`
   * `ADMIN_PASSWORD`
5. Click **Deploy**.

---

## 7. API Endpoints Reference

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/announcements` | Retrieve active announcements (with optional `category` and `search` filters) |
| `GET` | `/api/announcements/:id` | Get single announcement |
| `GET` | `/api/achievements` | Retrieve published achievements (with optional `category` filter) |
| `GET` | `/api/gallery` | Retrieve published gallery photos (with optional `category` and `limit` filters) |
| `POST` | `/api/inquiries` | Submit visitor contact / admission inquiry (with honeypot & rate-limiting) |
| `GET` | `/api/settings` | Retrieve institute public settings (Principal/Manager messages, contact details) |
| `GET` | `/api/files/:key` | Stream / proxy image files from Cloudflare R2 |

### Protected Admin Endpoints (`Authorization: Bearer <token>` required)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate admin and receive JWT token |
| `GET` | `/api/auth/verify` | Verify current admin token session |
| `POST` | `/api/auth/change-password` | Update admin password |
| `POST` | `/api/announcements` | Create new announcement / circular |
| `PUT` | `/api/announcements/:id` | Update announcement |
| `DELETE` | `/api/announcements/:id` | Delete announcement & associated R2 files |
| `POST` | `/api/achievements` | Create new milestone / accolade |
| `PUT` | `/api/achievements/:id` | Update milestone |
| `DELETE` | `/api/achievements/:id` | Delete milestone & associated R2 image |
| `POST` | `/api/gallery` | Add photo to media archive |
| `PUT` | `/api/gallery/:id` | Update photo details |
| `DELETE` | `/api/gallery/:id` | Delete photo & associated R2 image |
| `GET` | `/api/inquiries` | List all inquiries (with search & status filter) |
| `PUT` | `/api/inquiries/:id/read` | Mark inquiry as read |
| `PUT` | `/api/inquiries/:id` | Update inquiry status / details |
| `DELETE` | `/api/inquiries/:id` | Delete inquiry |
| `PUT` | `/api/settings` | Update institute profile and leadership desks |
| `POST` | `/api/upload` | Upload image or PDF document to Cloudflare R2 |

---

## 8. Security & Clean Deletion Guarantees

1. **Upload Security:** Server-side MIME type verification, extension verification, file size enforcement (max 25MB), and cryptographic random key generation.
2. **Orphaned File Cleanup:** Deleting an announcement, achievement, or gallery photo automatically deletes its corresponding object from Cloudflare R2.
3. **Anti-Spam Protections:** Inquiry submissions are protected with hidden honeypot validation, input sanitization, and sliding-window IP rate limiting (max 5 submissions per minute).
4. **Credential Security:** Admin passwords are encrypted using PBKDF2 with SHA-512 and unique salts. No plain text passwords are ever stored.
