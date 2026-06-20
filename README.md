# OddsFinance — CFA Level 1 Prep

A premium, mobile-first exam-prep web app for the CFA Level 1: adaptive quizzes,
3D-flip flashcards, a full exam simulator, progress analytics and a bilingual
(IT/EN) interface. Built with **React + Vite**, **Supabase** (auth + data),
**Framer Motion** and a **react-three-fiber** WebGL hero.

## Design system — "Aurora Glass"

- Light glassmorphism with deep-navy accent sections and layered depth
- Electric indigo `#3B5BFF` + violet tech accent + gold trust accent
- Fonts: **Fraunces** (display) · **Plus Jakarta Sans** (UI) · **JetBrains Mono** (numbers)
- Lucide vector icons (no emoji), full reduced-motion support

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase + Lemon Squeezy values
npm run dev            # http://localhost:5173
```

> A working `.env` is already included for the demo backend, so `npm run dev`
> runs out of the box.

### Build

```bash
npm run build     # outputs to /dist
npm run preview   # preview the production build locally
```

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_CHECKOUT_MONTHLY` | Lemon Squeezy monthly checkout URL |
| `VITE_CHECKOUT_ANNUAL` | Lemon Squeezy annual checkout URL |

## Project structure

```
src/
├─ App.jsx              # routing, auth session, premium polling
├─ theme.js             # design tokens (mirrors CSS variables)
├─ styles.css           # global "Aurora Glass" stylesheet
├─ data.js              # topics, mock fallback data, Supabase converters
├─ lib/supabase.js      # Supabase client + checkout URLs
├─ components/          # Logo, Hero3D, Nav, icons, auth fields, primitives
└─ screens/             # Landing, Login, Register, Forgot, Dashboard,
                        #  Quiz, Flashcards, Exam, Pricing, Profile
```

## Supabase tables used

`questions`, `flashcards`, `user_progress`, `exam_results`, `subscriptions`.
When a topic has no rows yet, the app falls back to bundled mock data so every
screen stays functional.

## Deploy

Any static host works (the build is a static SPA in `/dist`):

- **Vercel / Netlify** — import this GitHub repo, framework preset **Vite**,
  build `npm run build`, output `dist`. Add the `VITE_*` env vars in the
  dashboard.
- **Cloudflare Pages / GitHub Pages** — serve the `dist/` folder.

Remember to add the deployed URL to Supabase **Auth → URL Configuration**
(redirect URLs) so email confirmation and Google OAuth redirect back correctly.
