# Supabase Backend Setup & Deployment Guide (₹0/Month Free Tier)

This guide explains how to connect and deploy the **SSMO Institute of Teacher Education** website and admin management system with **Supabase**.

---

## 1. Architecture Overview

* **Frontend:** React + Vite + Tailwind CSS (Existing design preserved).
* **Database:** **Supabase PostgreSQL** (`announcements`, `gallery_albums`, `gallery_photos`, `achievements`, `enquiries`, `settings`, `admins`).
* **Storage:** **Supabase Storage** (Bucket: `ssmo-assets` for images and circular PDFs).
* **Authentication:** Admin JWT & Password Management.
* **Serverless Backend:** Vercel Serverless Functions (`/api/*`).
* **Cost:** **₹0 / $0 per month** (Supabase Free Tier + Vercel Hobby Free Tier).

---

## 2. Supabase Setup (3 Easy Steps)

### Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in.
2. Click **New Project**, select an organization, and choose a name (e.g. `ssmo-college`).
3. Choose a strong database password and select a region (e.g., *South Asia / Mumbai*).
4. Wait for the project to provision (~1-2 minutes).

### Step 2: Run Database Schema in Supabase SQL Editor

1. In your Supabase dashboard, click the **SQL Editor** icon in the left sidebar.
2. Click **New Query**.
3. Copy the entire contents of [supabase/schema.sql](file:///home/salim/Documents/ssmo-frontend/supabase/schema.sql) and paste it into the editor.
4. Click **Run** (Ctrl + Enter).
5. This creates all tables, Row Level Security (RLS) policies, indexes, the `ssmo-assets` storage bucket, and default seed data.

### Step 3: Get API Keys

1. In the left navigation, go to **Project Settings** > **API**.
2. Copy:
   * **Project URL** (`https://xyz.supabase.co`)
   * **anon / public key**
   * **service_role secret key** (revealed by clicking Reveal)

---

## 3. Configure Local Environment

Create a `.env` file in the project root:

```ini
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET_NAME=ssmo-assets
SUPABASE_JWT_SECRET=your_jwt_secret
```

---

## 4. Run Locally

```bash
# Start local development server
npm run dev
```

---

## 5. Deploy to Vercel

1. Push the repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/), import your repository.
3. Under **Environment Variables**, add:
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `SUPABASE_BUCKET_NAME` (`ssmo-assets`)
   * `SUPABASE_JWT_SECRET`
4. Click **Deploy**.

---

## 6. Admin Panel Access

* **URL:** `/admin`
* **Default Username:** `admin`
* **Default Password:** `ssmo@admin2026`

Administrators can add/edit/delete Announcements, Milestones, Photo Gallery entries, view & mark Student Inquiries as read, and update Principal & Manager welcome messages directly from the dashboard without touching code.
