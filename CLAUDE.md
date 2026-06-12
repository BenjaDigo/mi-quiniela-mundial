# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build locally
```

No test runner is configured. No linter is configured.

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- `VITE_FIREBASE_*` — Firebase project credentials (Auth + Firestore)
- `VITE_FOOTBALL_API_KEY` — football-data.org API key (free tier, `/competitions/WC/`)

## Architecture

React 18 + Vite SPA with Firebase (Auth + Firestore) as the backend and football-data.org as the external data source. No server-side code.

### Auth flow
`AuthContext` (`src/context/AuthContext.jsx`) wraps Firebase Auth. `App.jsx` gates all routes behind auth state: unauthenticated users see only `/login` and `/register`; authenticated users get `QuinielaProvider` wrapping all routes.

### Data flow
`QuinielaContext` (`src/context/QuinielaContext.jsx`) is the single source of truth for match data. It subscribes to Firestore's `matches` collection via `onSnapshot` and exposes `syncScores()` which calls football-data.org → writes to Firestore → triggers the live listener. Auto-sync fires every 5 minutes when any match is `IN_PLAY`/`PAUSED`.

### Firestore collections
- `quinielas/{id}` — quiniela metadata (name, adminUid, inviteCode, status)
- `quinielas/{id}/participants/{uid}` — per-user state: `teams[]`, `points`
- `matches/{id}` — match cache from football-data.org API
- `users/{uid}` — user profile (displayName, email)

### Scoring system
`src/utils/scoring.js` — `calcParticipantPoints(participant, matches, teamStages, scoring)` computes points by iterating the participant's `teams[]` array, calling `calcTeamPoints` per team. Group stage points come from finished match results; knockout round bonuses come from the `teamStages` map (`{ [teamCode]: stage }`). The `DEFAULT_SCORING` object defines all point values and can be overridden.

### Team assignment
`src/utils/teamAssignment.js` — `assignTeams(participantIds)` Fisher-Yates shuffles the 48 teams in `src/data/teams.js` and distributes them evenly. Leftover teams (48 % n participants) are silently dropped.

### Admin page
`/admin` is the control panel. Any authenticated user can access it (no role guard in the route). The admin who created a quiniela is identified by `adminUid === user.uid`. Actions: create quiniela, copy invite code, randomly assign teams, sync matches from API, recalculate all participant points.

### Styling
Tailwind CSS with a dark zinc palette and gold (`yellow-400/500`) accent. Reusable utility classes are defined in `src/index.css` under `@layer components`: `.btn-gold`, `.btn-outline`, `.card`, `.card-hover`, `.input-dark`, `.badge`, `.gold-text`, `.section-title`, `.live-dot`. Use these instead of raw Tailwind chains when a class already covers the pattern.
