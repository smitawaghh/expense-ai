# ExpenseAI — Frontend

The React + Vite single-page app for **ExpenseAI**. It talks to the Express/TypeScript API in [`../backend`](../backend) and handles auth with Firebase.

> For the full project overview, features, architecture, and setup, see the [main README](../README.md).

## Tech

`React 19` · `Vite` · `React Router` · `Recharts` · `Firebase Web SDK` · `axios`

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
```

The dev server proxies API calls to the backend running on `http://localhost:5000`, so start the backend first (see the [main README](../README.md#local-setup)).

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR    |
| `npm run build`   | Production build to `dist/`           |
| `npm run preview` | Preview the production build locally  |
| `npm run lint`    | Run ESLint over the project           |
