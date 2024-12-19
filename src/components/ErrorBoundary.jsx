import React from 'react';
import { HiExclamationCircle } from 'react-icons/hi';

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
    
    // Log error to your error tracking service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1e1e3f] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1e1e3f]/50 backdrop-blur-sm p-8 rounded-2xl border border-red-500/30 text-center">
            <div className="text-red-400 mb-4">
              <HiExclamationCircle className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-red-300 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-blue-300 mb-6">
              We're sorry, but something went wrong. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 text-left">
                <p className="text-red-300 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                <pre className="text-blue-300/70 font-mono text-xs overflow-auto max-h-48 p-4 bg-blue-900/20 rounded-xl">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
