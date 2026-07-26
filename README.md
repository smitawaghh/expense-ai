# ExpenseAI

**A full-stack personal expense tracker with a multi-provider AI assistant that answers questions about your spending in plain English.**

[Live Demo](#) · [Screenshot below](#screenshot)

> 📸 _Add a screenshot or GIF of the Dashboard here — recruiters skim images before text._

---

## Tech Stack

`TypeScript` `Express 5` `MongoDB / Mongoose` `Firebase Auth` `React 19` `Vite` `Recharts` `Zod` `Docker`

## Features

- **Per-user expense tracking** — Firebase Authentication (email/password) with every API request scoped to the signed-in user's `uid`, enforced server-side.
- **Ask AI** — a chat panel that answers questions like _"What did I spend the most on this month?"_ by feeding your last 90 days of expenses to an LLM (Gemini, Claude, or GPT-4o-mini, whichever key is configured — automatic fallback chain).
- **Spending analytics** — category breakdown, monthly trend charts, a computed "Spending Health Score," top-5 expenses, and CSV export.
- **Smart category detection** — typing a merchant name (e.g. "Swiggy", "Uber") auto-suggests the right category as you type, with a backend fallback that infers a category from the merchant/title if one is ever missing.
- **Split expenses** — track shared expenses with friends and mark them settled.
- **Validated, rate-limited API** — every request body is validated with Zod; all `/api` routes are rate-limited (100 req / 15 min).

## Architecture

```
frontend (React + Vite)  ──axios + Firebase ID token──▶  backend (Express + TypeScript)
                                                              │
                                                    Zod validation → Mongoose → MongoDB
                                                              │
                                                     /api/ask → Gemini / Claude / GPT-4o-mini
```

- **Auth**: the frontend attaches the signed-in user's Firebase ID token as `Authorization: Bearer <token>` on every request; the backend verifies it with Firebase Admin and scopes every DB query to that `uid` — one user can never see another user's data.
- **Validation**: all expense create/update payloads are parsed with [Zod](https://zod.dev) schemas before touching the database.
- **AI**: `POST /api/ask` pulls the last 90 days of the user's expenses, builds a grounded prompt, and calls whichever provider has a key configured (Gemini → Claude → OpenAI), so the demo works with any one free API key.

## Project Structure

```
expense-ai/
├── backend/    Express + TypeScript API (src/ → compiled to dist/)
│   └── src/
│       ├── routes/       expenses.ts, ask.ts
│       ├── models/       expense.ts (Mongoose schema)
│       └── utils/        categorize.ts (keyword → category rules)
└── frontend/   React + Vite SPA
    └── src/
        ├── pages/        Dashboard, Expenses, Analytics, AskAI
        └── components/   Sidebar, ExpenseModal, Layout, Footer
```

## Local Setup

**Prerequisites**: Node 18+, a MongoDB connection string (e.g. free [Atlas](https://www.mongodb.com/atlas) cluster), a Firebase project (Auth + a service account JSON).

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and at least one AI provider key
npm run dev             # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev              # http://localhost:5173
```

The backend also needs `firebaseServiceAccount.json` (downloaded from Firebase Console → Project Settings → Service Accounts) placed in `backend/`.

## Environment Variables

See [`backend/.env.example`](backend/.env.example). Only **one** AI provider key is required — the `/api/ask` route auto-detects whichever is set.

---

Built by **Smita Wagh** — [GitHub](https://github.com/smitawaghh) · [LinkedIn](https://linkedin.com/in/smitawaghh)

>>>>>>> 
>>>>>>> 10ad7203952d0e43ff77127385ad44306b645a2e
