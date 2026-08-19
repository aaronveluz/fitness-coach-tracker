// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/main.tsx
//
// Application entry point — Vite loads this file first.
// Mounts React into the #root div in index.html.
// All global providers (auth, query client, router) are applied here.
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './app/providers';
import { AppRouter } from './app/router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* AppProviders wraps the entire app with QueryClient, auth context, etc. */}
    <AppProviders>
      {/* AppRouter renders the correct page based on the current URL */}
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);

