# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # VELLA IT SUPPORT

  Production-ready IT ticketing system built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, Supabase, Microsoft Entra ID, and Vercel.

  ## What is included

  - Microsoft sign-in with role routing for admins and employees
  - Supabase schema and RLS policies
  - User and admin dashboards
  - Ticket creation, detail view, comments, feedback, and admin updates
  - Microsoft Graph notification service wiring
  - Deployment and setup documentation

  ## Local development

  1. Copy `.env.example` to `.env.local`.
  2. Fill in the Supabase, Entra ID, and Graph values.
  3. Run `npm install`.
  4. Run `npm run dev`.

  ## Useful scripts

  - `npm run dev` starts the Next.js dev server.
  - `npm run build` creates a production build.
  - `npm run start` serves the production build.
  - `npm run typecheck` runs the TypeScript compiler.
  - `npm run lint` runs ESLint.

  ## Documentation

  - Supabase setup: `docs/setup.md`
  - Microsoft Entra ID setup: `docs/microsoft-entra.md`
  - Vercel deployment: `docs/vercel-deployment.md`
  - Database schema: `supabase/schema.sql`
