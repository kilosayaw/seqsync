import React from 'react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <p className="text-lg mb-6 text-center">
            An unexpected error occurred. Reloading the application may fix the issue.
          </p>
          <details className="w-full max-w-2xl bg-gray-800 p-4 rounded-md mb-6">
            <summary className="cursor-pointer text-yellow-400">Error Details</summary>
            <pre className="mt-2 text-sm text-red-300 whitespace-pre-wrap break-all">
              {this.state.error?.toString()}
              {"\n"}
              {this.state.error?.stack}
            </pre>
          </details>
          <Button onClick={this.handleReload} variant="primary">
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;