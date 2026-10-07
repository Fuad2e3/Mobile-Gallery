# 🚀 Cloudflare Deployment Guide — Mobile Gallery

This manual provides the complete, authoritative operational instructions for deploying and running **Mobile Gallery** on **Cloudflare Pages (with Pages Functions)**, **Cloudflare D1 (Database)**, and **Cloudflare R2 (Photo Storage)**.

---

## 1. Prerequisites Checklist

Before proceeding with deployment, ensure the following are installed and configured:

1. **Node.js**: Version 18.0.0 or higher (`node -v`).
2. **Wrangler CLI**: Cloudflare developer command line (`npm install -g wrangler` or use `npx wrangler`).
3. **Cloudflare Account**: Active Cloudflare account with D1 and R2 enabled.
4. **Cloudflare Authentication**:
   ```bash
   npx wrangler login
   ```
   Verify authentication status:
   ```bash
   npx wrangler whoami
   ```

---

## 2. Step-by-Step Deployment Procedure

### Step 1: Provision the Cloudflare D1 Database

Run the following command in the project root directory:

```bash
npx wrangler d1 create mobile-gallery-db
```

Output will display configuration similar to:
```toml
[[d1_databases]]
binding = "DB"
database_name = "mobile-gallery-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

👉 **Action Required**: Open [wrangler.toml](file:///c:/Users/fuadk/Documents/GitHub/Mobile-Gallery/wrangler.toml) and replace `"REPLACE_WITH_YOUR_D1_DATABASE_ID"` with your newly generated `database_id`.

---

### Step 2: Initialize D1 Database Schema & Seed Data

**1. Create Tables and Indexes:**
```bash
npx wrangler d1 execute mobile-gallery-db --remote --file=./database/schema.sql
```
This executes [database/schema.sql](file:///c:/Users/fuadk/Documents/GitHub/Mobile-Gallery/database/schema.sql) on Cloudflare D1, provisioning:
- `users` table
- `products` table
- `orders` table
- All performance indexes

**2. Populate Initial Catalog & Admin Profile:**
```bash
npx wrangler d1 execute mobile-gallery-db --remote --file=./database/seed.sql
```
This inserts the 24 built-in smartphone and gadget listings alongside the default administrator profile.

> 💡 **For Local Offline Testing:**
> ```bash
> npm run db:init:local
> npm run db:seed:local
> ```

---

### Step 3: Provision the Cloudflare R2 Photo Storage Bucket

Create the R2 storage bucket to house all compressed product photos:

```bash
npx wrangler r2 bucket create mobile-gallery-photos
```

The binding in [wrangler.toml](file:///c:/Users/fuadk/Documents/GitHub/Mobile-Gallery/wrangler.toml) is pre-configured as:
```toml
[[r2_buckets]]
binding = "PHOTOS_BUCKET"
bucket_name = "mobile-gallery-photos"
```

---

### Step 4: Deploy to Cloudflare Pages

Cloudflare Pages automatically serves your frontend static assets from the root and powers all API routes (`/api/*`) via **Pages Functions** located in `functions/api/`:

#### Option A: Direct CLI Deployment
```bash
npx wrangler pages deploy . --project-name=mobile-gallery
```

#### Option B: Git-Integrated Deployment via Cloudflare Dashboard
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Pages** ➔ **Create a project** ➔ **Connect to Git**.
3. Select your `Mobile-Gallery` GitHub repository.
4. Set Build Settings:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `.`
5. Once deployed, open **Settings** ➔ **Functions**:
   - Under **D1 database bindings**, add variable name `DB` linked to `mobile-gallery-db`.
   - Under **R2 bucket bindings**, add variable name `PHOTOS_BUCKET` linked to `mobile-gallery-photos`.

---

## 3. Post-Deployment Verification

Verify operational health by requesting the edge ping endpoint:
```bash
curl -X GET https://<your-project>.pages.dev/api/ping
```
Expected response:
```json
{
  "ok": true,
  "message": "Mobile Gallery Cloudflare Edge API is live and operational.",
  "databaseConnected": true,
  "r2StorageConnected": true
}
```

---

## 4. Default System Credentials

- **Admin Login Page**: `/admin.html`
- **Admin Email**: `admin@mobilegallery.com`
- **Admin Password**: `admin123`

---

## 5. Troubleshooting & Diagnostics

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `D1 binding (env.DB) is missing` | Missing `database_id` in `wrangler.toml` or dashboard | Ensure `DB` binding is set in `wrangler.toml` and Cloudflare Pages settings. |
| `R2 bucket not found` | Bucket name mismatch | Run `npx wrangler r2 bucket create mobile-gallery-photos`. |
| `Image upload fallback` | `PHOTOS_BUCKET` binding missing | Ensure `binding = "PHOTOS_BUCKET"` matches in `wrangler.toml`. |
| CORS failure on external API calls | Calling wrong domain | Ensure Cloudflare API handles `OPTIONS` preflight; client auto-detects relative `/api`. |
