# 🏉 Kenya Cup Fantasy Rugby (v2)

A full-stack fantasy sports platform engineered specifically for the Kenya Cup rugby union franchise. Built with Next.js, Supabase, and Zustand, featuring live Tisini stats integration, dynamic pricing, and a highly secure, isolated Admin Portal.

## 🚀 Version 2.0 Features
*   **Expanded 23-Man Squads:** Build a complete matchday roster featuring 15 starters and 8 bench players using granular, true-to-life rugby positions (e.g., Loosehead Prop, Blindside Flanker, Inside Center).
*   **Rolling Matchday Lockouts:** Players lock individually at the exact minute their real-world fixture kicks off. Unlimited transfers apply to unlocked players.
*   **Advanced Tactical Boosters:** Deploy single-use chips including Triple Captain, Bench Boost, Limitless, and Co-Captains.
*   **Dynamic Player Pricing:** A built-in economy where player valuations fluctuate based on form and gameweek performance.
*   **Unified Scoring Engine:** A complex, positional scoring matrix awarding points for specific rugby actions (e.g., 50:22 kicks, lineout steals, 100% scrum success for forwards).
*   **Single Team, Infinite Leagues:** Manage one core roster that perfectly mirrors across the Global Leaderboard and infinite private mini-leagues.
*   **Isolated Admin Portal:** A strictly secured, edge-middleware-protected dashboard for real-time fixture management, Cloudinary media routing, and manual stat overrides.

## 🛠️ Tech Stack
*   **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS.
*   **State Management:** Zustand.
*   **Database & Auth:** Supabase (PostgreSQL, RLS).
*   **Media Storage:** Cloudinary.

## 💻 Local Development Setup
1. Clone the repository and install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and add your Supabase and Cloudinary keys.
3. Run the development server: `npm run dev`
