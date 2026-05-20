# Practical 5: Implementing Cloud Storage with Supabase

## Overview

This practical upgrades the TikTok clone application by migrating from local file storage to cloud-based storage using Supabase Storage. Videos and thumbnails are uploaded directly from the browser to Supabase buckets, improving the application's scalability, reliability, and performance.

---

## Objectives

- Understand the limitations of local file storage and the benefits of cloud storage
- Set up Supabase Storage buckets with appropriate access policies
- Integrate Supabase into the backend to handle file uploads and deletions
- Update the frontend to upload files directly to Supabase
- Migrate any existing locally stored files to Supabase

---

## Prerequisites

- Completion of Practical 4 (TikTok server with PostgreSQL and Prisma)
- A Supabase account (free tier at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Existing TikTok frontend (Next.js) and backend (Express + Prisma) projects

---

## Project Structure Changes

```
server/
├── src/
│   ├── lib/
│   │   └── supabase.js          # Supabase client (backend)
│   ├── services/
│   │   └── storageService.js    # Upload/delete helpers for Supabase
│   └── controllers/
│       └── videoController.js   # Updated to use cloud storage
├── scripts/
│   └── migrateVideosToSupabase.js  # One-time migration script
└── prisma/
    └── schema.prisma            # Updated with storage path fields

tiktok_frontend/
├── src/
│   ├── lib/
│   │   └── supabase.js          # Supabase client (frontend)
│   ├── services/
│   │   └── uploadService.js     # Updated for direct Supabase uploads
│   ├── app/
│   │   └── upload/
│   │       └── page.jsx         # Updated upload page
│   └── components/
│       └── ui/
│           └── VideoCard.jsx    # Updated to handle Supabase URLs
```

---

## Part 1: Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**, give it a name (e.g., `tiktok`), choose a region, and create it
3. Wait for the project to finish provisioning

### Step 2: Create Storage Buckets

1. In the Supabase dashboard, navigate to **Storage** in the left sidebar
2. Create a bucket named `videos` with **Public** access
3. Create a bucket named `thumbnails` with **Public** access

### Step 3: Set Up Access Policies

For each bucket, set the following policies:

**Upload policy (videos & thumbnails):**
- Policy name: `Authenticated users can upload videos`
- Allowed operations: All
- Target roles: `authenticated`

**View policy (videos & thumbnails):**
- Policy name: `Public can view videos`
- Allowed operations: `SELECT`
- Target roles: `anon, authenticated`

### Step 4: Get Your API Keys

In the Supabase dashboard, go to **Settings > API** and copy:
- **Project URL** → `SUPABASE_URL`
- **service_role** key → `SUPABASE_SERVICE_KEY` (keep this secret — backend only)
- **anon** key → `SUPABASE_PUBLIC_KEY` (safe for frontend)

---

## Part 2: Backend Implementation

### Step 1: Install the Supabase SDK

```bash
cd server
npm install @supabase/supabase-js
```

### Step 2: Create the Supabase Client

Create `src/lib/supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;
```

### Step 3: Update Environment Variables

Add to your `.env` file:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_PUBLIC_KEY=your-anon-key
SUPABASE_STORAGE_URL=https://your-project-id.supabase.co/storage/v1
```

### Step 4: Create the Storage Service

Create `src/services/storageService.js` with helper functions for uploading and deleting files from Supabase buckets.

### Step 5: Update Video Controller

Update `src/controllers/videoController.js` so that `createVideo` uploads files to Supabase via the storage service, and `deleteVideo` removes the corresponding files from Supabase when a video is deleted.

### Step 6: Update Prisma Schema

Add storage path fields to the `Video` model in `prisma/schema.prisma`:

```prisma
model Video {
  id                   Int       @id @default(autoincrement())
  userId               Int       @map("user_id")
  caption              String?
  videoUrl             String    @map("video_url")
  thumbnailUrl         String?   @map("thumbnail_url")
  audioName            String?   @map("audio_name")
  videoStoragePath     String?   @map("video_storage_path")
  thumbnailStoragePath String?   @map("thumbnail_storage_path")
  views                Int       @default(0)
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @default(now()) @updatedAt @map("updated_at")
  comments             Comment[]
  likes                VideoLike[]
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("videos")
}
```

Then run the migration:

```bash
npx prisma migrate dev --name add_storage_paths
```

---

## Part 3: Frontend Implementation

### Step 1: Install the Supabase Client

```bash
cd tiktok_frontend
npm install @supabase/supabase-js
```

### Step 2: Create the Supabase Client

Create `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials. Check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
```

### Step 3: Update Frontend Environment Variables

Create or update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLIC_KEY=your-anon-key
```

### Step 4: Update Upload Service and Components

- `src/services/uploadService.js` — Update to handle direct uploads to Supabase
- `src/app/upload/page.jsx` — Update to use the new upload service
- `src/components/ui/VideoCard.jsx` — Update `getFullVideoUrl` to correctly resolve Supabase CDN URLs

---

## Part 4: Migration (If Applicable)

If you have existing videos stored locally, run the migration script to move them to Supabase:

```bash
cd server
node scripts/migrateVideosToSupabase.js
```

After verifying all videos play correctly from Supabase URLs, you can safely remove the local uploads directory.

---

## Reference Code

Full source code for both the server and frontend is available at:
- Backend: [https://github.com/syangche/TikTok_Server.git](https://github.com/syangche/TikTok_Server.git)
- Frontend: [https://github.com/syangche/TikTok_Frontend.git](https://github.com/syangche/TikTok_Frontend.git)

---

## Key Concepts

**Cloud Storage vs Local Storage** — Local storage is limited by disk space, doesn't scale across multiple servers, and lacks automatic backups. Cloud storage provides virtually unlimited capacity, built-in redundancy, and global CDN delivery.

**Supabase Buckets** — Files are organized in buckets, each with its own access policies. Public buckets allow anyone to read files, while upload access is restricted to authenticated users.

**Direct Upload Pattern** — Files are uploaded from the browser directly to Supabase (not through your server), reducing server load and improving performance.

**Service Key vs Anon Key** — The `service_role` key bypasses row-level security and must only be used on the backend. The `anon` key is safe to expose on the frontend.

---

## Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)
- [Content Delivery Networks Explained](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/)