import React, { Component } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught runtime error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090B] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full mb-6">
            <AlertOctagon className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Application Error</h1>
          <p className="text-slate-400 max-w-md text-sm mb-4">
            A runtime error occurred in the component tree.
          </p>
          {this.state.error && (
            <pre className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left text-xs font-mono text-red-400 max-w-2xl overflow-auto mb-6">
              {this.state.error.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Page</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
