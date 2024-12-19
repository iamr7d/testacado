import React from 'react';
import { motion } from 'framer-motion';
import { HiExclamationCircle, HiRefresh, HiHome } from 'react-icons/hi';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1e1e3f] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-[#1e3a8a]/20 backdrop-blur-lg p-8 rounded-2xl border border-blue-500/30"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <HiExclamationCircle className="w-16 h-16 text-red-500 mb-4" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
              <p className="text-blue-300/80 mb-6">
                Don't worry, it's not your fault. We're working on fixing this issue.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full mb-6">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                    <p className="text-red-400 text-sm font-mono overflow-auto">
                      {this.state.error.toString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <HiRefresh className="w-5 h-5" />
                  <span>Try Again</span>
                </motion.button>

                <Link to="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a]/20 hover:bg-[#1e3a8a]/30 text-blue-300 rounded-xl transition-colors"
                  >
                    <HiHome className="w-5 h-5" />
                    <span>Go Home</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
