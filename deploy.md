# 🚀 Kenya Cup Fantasy Rugby – Production Deployment Guide

This guide walks you through deploying the Kenya Cup Fantasy Rugby platform from your GitHub repository to **Vercel** with full production scaling, Supabase connection pooling, Edge security middleware, and Cloudinary media pipelines.

---

## 📋 1. Pre-Deployment Database Setup (Supabase)

Before deploying to Vercel, prepare your Supabase production database:

1. Open the **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project and navigate to the **SQL Editor**.
3. Open `supabase/schema.sql` from this repository.
4. Paste the entire SQL schema and run it. This will:
   - Enable Row Level Security (**RLS**) across all tables (`players`, `fixtures`, `squads`, `leagues`, `clubs`, `fantasy_users`, `match_events`).
   - Create tables, relational foreign keys, indexes, and automated rank recalculation triggers.
   - Seed the 12 official Kenya Cup clubs and administrative roles.
   - Add dynamic transfer market columns (`previous_cost`, `form_rating`) and user avatar support (`avatar_url`).

---

## ⚡ 2. Linking GitHub Repository to Vercel

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: production readiness, edge security, dynamic pricing & scoring overhaul"
   git push origin main
   ```
2. Open the **[Vercel Dashboard](https://vercel.com/new)** and click **Add New Project**.
3. Import your GitHub repository (`fantasy_rugbyapp`).
4. **Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `next build` (or leave default)
   - **Output Directory**: `.next` (default)
   - **Node.js Version**: `20.x` or `22.x`

---

## 🔐 3. Injecting Production Environment Variables

Under the **Environment Variables** tab in your Vercel project settings, inject the following keys:

### A. Core App Configuration
| Variable Name | Example / Production Value | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Canonical production URL |
| `NEXT_PUBLIC_SEASON` | `26/27` | Active tournament season |
| `NEXT_PUBLIC_CURRENT_GAMEWEEK` | `1` | Active starting round |

### B. Supabase (Database, Auth & PgBouncer Connection Pooling)
| Variable Name | Value Location in Supabase Dashboard | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project Settings → API → Project URL** | Standard HTTPS REST endpoint |
| `NEXT_PUBLIC_SUPABASE_POOLED_URL` | **Project Settings → Database → Connection Pooling** | Supavisor/PgBouncer endpoint to withstand 30-min kickoff concurrency spikes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project Settings → API → `anon` `public` key** | Public client-side token with RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **Project Settings → API → `service_role` key** | Privileged server-side key (**never expose in public**) |

### C. Cloudinary (Media Delivery & Avatars)
| Variable Name | Value Location in Cloudinary Console | Description |
|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | **Dashboard → Cloud Name** (`dsidwfnbw`) | Public cloud identifier |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | **Settings → Access Keys → API Key** | Client widget authentication |
| `CLOUDINARY_API_SECRET` | **Settings → Access Keys → API Secret** | Server operations secret |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | **Settings → Upload → Upload Presets** | Unsigned upload preset: `kc_players` |
| `NEXT_PUBLIC_KENYA_CUP_LOGO_URL` | Cloudinary URL | Official tournament badge |
| `NEXT_PUBLIC_KRU_LOGO_URL` | Cloudinary URL | Official KRU federation crest |

### D. Security & Edge Middleware
| Variable Name | Recommended Value | Description |
|---|---|---|
| `ADMIN_SECRET_KEY` | Random 64-character secret string | Cryptographic key used by `middleware.ts` to sign and verify Edge tokens |
| `ADMIN_EMAIL` | `your-admin@kenyacupfantasy.co.ke` | Master admin account email |

---

## ☁️ 4. Cloudinary Upload Preset Configuration

To allow fans to upload avatars and admins to upload club badges:

1. Open **[Cloudinary Console](https://console.cloudinary.com/)**.
2. Go to **Settings (Gear Icon) → Upload → Upload Presets**.
3. Click **Add Upload Preset**:
   - **Preset name**: `kc_players`
   - **Signing Mode**: **Unsigned**
   - **Folder**: Leave dynamic or set default to `kenya-cup`
4. Click **Save**.

---

## 🛡️ 5. Post-Deployment Verification Checklist

Once Vercel finishes building:

1. **Edge Admin Deflection**:
   - Navigate to `/admin` in an Incognito browser window.
   - Verify that the Edge Middleware (`middleware.ts`) immediately deflects you to `/` without rendering the admin dashboard.
2. **Admin Direct Login**:
   - Navigate directly to `/admin/login` and log in with your administrative credentials or Master Key.
   - Verify that the `kc_admin_token` cookie is assigned and the dashboard loads.
3. **Manager Avatar Upload**:
   - Log in as a fan, navigate to `/profile`, and upload a manager avatar.
   - Verify that the avatar persists and reflects in `/leagues` on the leaderboard.
4. **Favicon Display**:
   - Verify that your Kenya Cup favicon renders cleanly in the browser tab on both desktop and mobile.
5. **Pricing Engine Trigger**:
   - When round 1 finishes, trigger `/api/admin/pricing` via the admin dashboard to calculate the new player valuations.

