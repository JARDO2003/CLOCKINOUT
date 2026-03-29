import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Admin } from './Admin';
import './index.css';

// Get current user
function getCurrentUser() {
  const session = sessionStorage.getItem('lambda_user_session');
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

// Router component
function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setUser(getCurrentUser());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle navigation
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('lambda_user_session');
    setUser(null);
    navigate('/');
  };

  // Route matching
  if (currentPath === '/admin') {
    // Check admin access
    if (!user || user.role !== 'admin') {
      // Redirect to home if not admin
      window.history.replaceState({}, '', '/');
      return <App />;
    }
    return <Admin onLogout={handleLogout} />;
  }

  return <App />;
}

// Register Service Worker for FCM
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('[FCM] Service Worker registered:', registration.scope);
    })
    .catch((err) => {
      console.error('[FCM] Service Worker registration failed:', err);
    });
}

// Render app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
