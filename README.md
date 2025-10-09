# AI Agents Visualization

This is a **React + Vite + TypeScript** project for visualizing the
internal logic and behavior of the project "AI Agents".

## 🧩 Project structure

    frontend/
     └─ src/
         ├─ assets/      → images, icons, and static files
         ├─ components/  → reusable UI components
         ├─ context/     → React context providers
         ├─ data/        → static or mock data (JSON)
         ├─ hooks/       → custom React hooks
         ├─ layouts/     → page layout components
         ├─ pages/       → individual pages (React Router)
         ├─ services/    → API logic and data fetchers
         ├─ styles/      → CSS/SCSS files and variables
         ├─ types/       → TypeScript interfaces and enums
         ├─ utils/       → helper functions and constants
         ├─ main.tsx     → entry point
         └─ App.tsx      → main app container

## ⚙️ Development

To start local development:

``` bash
cd frontend
npm install
npm run dev
```

## 🚀 Deployment

Deployment is fully automated via **Vercel**. Every push to `main`
redeploys the production version.\
Every pull request creates a unique preview URL.

## 🤖 GPT Collaboration

When using GPT for code edits: - Components live in `src/components` -
Pages in `src/pages` - Global logic in `src/context` or `src/services` -
Only modify files under `src/` - Avoid touching build configs unless
requested

------------------------------------------------------------------------

## 🔒 Notes

-   React + Vite + TypeScript stack
-   ESLint + Prettier (optional setup later)
