# 🏉 Kenya Cup Fantasy Rugby

[![CI](https://github.com/your-org/fantasy_rugbyapp/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/fantasy_rugbyapp/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-grade, open-source fantasy sports web platform built specifically for the **Kenya Cup Rugby Union Tournament**. Compete against managers across the country, assemble your starting XV within a strict salary cap, track live match performance powered by Tisini data, and battle in private mini-leagues.

---

## 📋 Table of Contents
1. [Core Features](#-core-features)
2. [System Architecture](#-system-architecture)
3. [Tech Stack](#-tech-stack)
4. [Squad Building Rules & Constraints](#-squad-building-rules--constraints)
5. [Scoring System](#-scoring-system)
6. [Environment Configuration](#-environment-configuration)
7. [Local Development Setup](#-local-development-setup)
8. [Database Setup (Supabase)](#-database-setup-supabase)
9. [Automated CI/CD Workflows](#-automated-cicd-workflows)
10. [Admin Operations Portal](#-admin-operations-portal)
11. [Contributing & License](#-contributing--license)

---

## ✨ Core Features

- **Tactical 3D Pitch View:** Authentic 15-player rugby union formation (Props, Hooker, Locks, Flankers, Number 8, Scrum-half, Fly-half, Centers, Wings, Full-back) rendered on an isometric 3D grass pitch with regulation pitch markings.
- **Strict Budget & Club Limits:** KES 100M salary cap with multi-tier player valuations, max 3 players per club, and position-specific requirements.
- **Live Matchday Statistics:** Scoring logic powered by Tisini live match statistics, calculating tackles, lineouts won/lost, carries, tries, conversions, and disciplinary cards.
- **Captain & Vice-Captain Boosters:** Dynamic captain multiplier (2× points) with automated vice-captain fallback.
- **Mini-Leagues & Standings:** Compete in national public tables or create private leagues with 6-character unique invite codes and live rank-change tracking.
- **Cloudinary Media Pipeline:** Automated player headshot and club crest uploads with fast CDN delivery and format optimization.
- **Isolated Admin Portal:** Dedicated administrative operations console (`/admin/login` and `/admin`) with Supabase role-based security (`is_admin: true`) for club management, player registry updates, and manual match stat overrides.

---

## 🏛 System Architecture

```mermaid
graph TD
    Client["Fan Browser / Mobile Client"] -->|HTTPS / Next.js 16| NextApp["Next.js App Router (React 19)"]
    Admin["Tournament Admin"] -->|Isolated Auth /admin/login| NextApp
    
    subgraph Client State & UI
        NextApp --> Zustand["Zustand Store (Persisted Squad & UI State)"]
        NextApp --> Pitch3D["3D Pitch & Tactical Grid UI"]
    end
    
    subgraph Data & Storage
        NextApp -->|Row-Level Security (RLS)| Supabase["Supabase (PostgreSQL 15)"]
        Supabase --> DB_Auth["Supabase Auth (JWT)"]
        Supabase --> DB_Tables["Tables (players, clubs, squads, fixtures, match_events)"]
        NextApp -->|Client & Server CDN| Cloudinary["Cloudinary Media CDN (AVIF Headshots & Crests)"]
    end
```

---

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server & Client Components)
- **UI & Components:** [React 19](https://react.dev/), [Lucide React](https://lucide.dev/) (Athletic sports icon set)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS design tokens
- **Client State:** [Zustand v5](https://github.com/pmndrs/zustand) with `localStorage` synchronization
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Media CDN:** [Cloudinary](https://cloudinary.com/) (Unsigned upload widgets and optimized delivery)
- **Type Safety & Linting:** TypeScript 5 (strict mode) and ESLint 9

---

## 🏉 Squad Building Rules & Constraints

Each manager must field a complete 15-player rugby union squad matching regulation positioning:

| Position | Min Players | Max Players | Pitch Slots |
|:---|:---:|:---:|:---:|
| **Loosehead / Tighthead Prop** | 2 | 3 | Slot 1, 3 |
| **Hooker** | 1 | 2 | Slot 2 |
| **Lock (Second Row)** | 2 | 3 | Slot 4, 5 |
| **Flanker (Blindside / Openside)** | 2 | 3 | Slot 6, 7 |
| **Number 8** | 1 | 2 | Slot 8 |
| **Scrum-half** | 1 | 2 | Slot 9 |
| **Fly-half** | 1 | 2 | Slot 10 |
| **Center (Inside / Outside)** | 2 | 3 | Slot 12, 13 |
| **Wing (Left / Right)** | 2 | 3 | Slot 11, 14 |
| **Full-back** | 1 | 2 | Slot 15 |

### Financial & Club Quotas
- **Total Salary Cap:** KES 100,000,000
- **Club Limit:** Maximum 3 players from any single Kenya Cup club
- **Tier 1:** KES 10.0M · **Tier 2:** KES 7.5M · **Tier 3:** KES 5.5M · **Tier 4:** KES 3.5M

---

## ⚡ Scoring System

Points are calculated on actual match performance derived from official match sheets:

| Action | Points | Category |
|:---|:---:|:---|
| **Try Scored** | `+5` | Scoring |
| **Try Assist** | `+3` | Playmaking |
| **Conversion** | `+2` | Kicking |
| **Penalty Goal** | `+3` | Kicking |
| **Drop Goal** | `+3` | Kicking |
| **Completed Tackle** | `+0.5` | Defense |
| **Ball Carry** | `+0.5` | Attack |
| **Lineout Won on Own Throw** | `+1` | Set Piece |
| **Lineout Lost on Own Throw** | `-1` | Set Piece |
| **Scrum Won on Own Feed** | `+1` | Set Piece |
| **Scrum Lost on Own Feed** | `-1` | Set Piece |
| **Yellow Card** | `-3` | Discipline |
| **Red Card** | `-5` | Discipline |
| **60+ Minutes Played** | `+2` | Appearance |
| **30–59 Minutes Played** | `+1` | Appearance |
| **Captain Selected** | **×2** | Multiplier |

---

## 🔐 Environment Configuration

Create a local `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

### Configuration Variables Reference

| Variable | Scope | Description | Example |
|:---|:---:|:---|:---|
| `NEXT_PUBLIC_APP_URL` | Client & Server | Canonical application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SEASON` | Client & Server | Active tournament season identifier | `26/27` |
| `NEXT_PUBLIC_CURRENT_GAMEWEEK` | Client & Server | Active tournament round number | `4` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Supabase project API URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Supabase anonymous public key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | Supabase privileged service key (keep secret) | `eyJhbG...` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client & Server | Cloudinary Cloud Name for CDN assets | `kenya-rugby` |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Client & Server | Cloudinary API Key for client upload widget | `1234567890` |
| `CLOUDINARY_API_SECRET` | Server Only | Cloudinary API Secret (keep secret) | `secret-token` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`| Client | Unsigned upload preset for player assets | `kc_players` |
| `ADMIN_SECRET_KEY` | Server Only | Secure passphrase for admin routes & webhooks | `your-secret-key` |

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- **Supabase Account:** Free tier at [supabase.com](https://supabase.com) (or local Supabase CLI)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/fantasy_rugbyapp.git
   cd fantasy_rugbyapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Update variables in .env.local with your Supabase & Cloudinary credentials
   ```

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

5. **Verify code quality:**
   ```bash
   # Run ESLint
   npm run lint

   # Run TypeScript strict type verification
   npm run type-check

   # Validate production Next.js build
   npm run build
   ```

---

## 🗄 Database Setup (Supabase)

1. Create a new project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the contents of [`supabase/schema.sql`](supabase/schema.sql).
   This script configures:
   - Full relational schema (`players`, `clubs`, `fixtures`, `squads`, `squad_players`, `leagues`, `league_members`, `match_events`).
   - Row Level Security (RLS) policies for user data isolation.
   - Seed data for all 12 active Kenya Cup clubs.
   - Automatic point calculation generated columns.

### Granting Administrator Privileges
To promote a user account to an Administrator:
```sql
UPDATE fantasy_users 
SET is_admin = true 
WHERE email = 'admin@yourdomain.com';
```

---

## 🔄 Automated CI/CD Workflows

Every pull request and push to `main` is validated automatically via **GitHub Actions** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

- **Environment Setup:** Node.js 20 on Ubuntu latest.
- **Dependency Cache:** Clean install with `npm ci`.
- **Linting:** ESLint verification with Next.js core web vitals.
- **Static Type Checking:** `tsc --noEmit` across all components and server handlers.
- **Production Compilation:** Next.js Turbopack build with static generation checks.

---

## 🛡 Admin Operations Portal

The platform features an isolated operations console:
- **Admin Login Route:** Access exclusively via `/admin/login`.
- **Authorization:** Fans attempting to log in via `/admin/login` are rejected; credentials must match an authenticated Supabase user with `is_admin: true`.
- **Capabilities:**
  - **Player Registry:** Add, update, and manage players across all 12 Kenya Cup clubs. Upload headshots directly via Cloudinary.
  - **Club Registry:** Manage clubs, abbreviations, crests, and colors (relegation/promotion safe).
  - **Fixture Controller:** Update gameweek kickoff times, record final scores, and input official matchday statistics.

---

## 📄 Contributing & License

Contributions are welcome! Please open an issue to discuss proposed features or submit a pull request with unit/type-check verification.

Distributed under the **MIT License**. See `LICENSE` for more information.
