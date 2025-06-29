// src/components/common/ErrorBoundary.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
        this.props.onReset();
    } else {
        // Fallback: navigate to home or reload. Reload is simpler here.
        window.location.href = '/'; // Or window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 p-4 text-center">
          <h1 className="text-3xl font-orbitron text-red-500 mb-4">Oops! Something Went Wrong</h1>
          <p className="text-gray-400 mb-6">
            An unexpected error occurred in the application. We apologize for the inconvenience.
          </p>
          {import.meta.env.DEV && this.state.error && ( // Use Vite's env var for development
            <details className="mb-6 text-left bg-gray-800 p-4 rounded-md max-w-2xl mx-auto overflow-auto">
              <summary className="cursor-pointer font-semibold text-red-400">Error Details (Dev Mode)</summary>
              <pre className="mt-2 text-xs text-gray-300 whitespace-pre-wrap">
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <Button onClick={this.handleReset} variant="primary">
            Try Again or Go Home
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
};

export default ErrorBoundary;