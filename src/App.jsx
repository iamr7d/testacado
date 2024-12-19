import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import Calendar from './pages/Calendar';
import EmailGenerator from './pages/EmailGenerator';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Home />,
      errorElement: <ErrorBoundary />
    },
    {
      path: "/opportunities",
      element: <Opportunities />,
      errorElement: <ErrorBoundary />
    },
    {
      path: "/calendar",
      element: <Calendar />,
      errorElement: <ErrorBoundary />
    },
    {
      path: "/email",
      element: <EmailGenerator />,
      errorElement: <ErrorBoundary />
    },
    {
      path: "/profile",
      element: <Profile />,
      errorElement: <ErrorBoundary />
    },
    {
      path: "*",
      element: <Home />,
      errorElement: <ErrorBoundary />
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
    <RouterProvider router={router} />
  );
}

export default App;
