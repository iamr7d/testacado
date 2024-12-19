import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import Calendar from './pages/Calendar';
import EmailGenerator from './pages/EmailGenerator';
import Profile from './pages/Profile';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <PageTransition><Home /></PageTransition>
    },
    {
      path: "/opportunities",
      element: <PageTransition><Opportunities /></PageTransition>
    },
    {
      path: "/calendar",
      element: <PageTransition><Calendar /></PageTransition>
    },
    {
      path: "/email",
      element: <PageTransition><EmailGenerator /></PageTransition>
    },
    {
      path: "/profile",
      element: <PageTransition><Profile /></PageTransition>
    },
    {
      path: "*",
      element: <PageTransition><Home /></PageTransition>
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);

function App() {
  return (
    <ErrorBoundary>
      <div className="app-container">
        <RouterProvider 
          router={router} 
          future={{ 
            v7_startTransition: true 
          }} 
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
