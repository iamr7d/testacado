import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import Calendar from './pages/Calendar';
import EmailGenerator from './pages/EmailGenerator';
import Profile from './pages/Profile';
import { motion, AnimatePresence } from 'framer-motion';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <Navbar />
          <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
            <AnimatePresence mode="wait">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <PageTransition>
                      <Home />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/opportunities" 
                  element={
                    <PageTransition>
                      <Opportunities />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/calendar" 
                  element={
                    <PageTransition>
                      <Calendar />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/email" 
                  element={
                    <PageTransition>
                      <EmailGenerator />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PageTransition>
                      <Profile />
                    </PageTransition>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </main>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;
