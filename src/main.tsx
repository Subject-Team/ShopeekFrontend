import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register the service worker only in production builds: in dev it would
// serve stale bundles across code changes.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline-first is best-effort; the app works fully without it.
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
