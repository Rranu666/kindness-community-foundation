import { Component } from 'react';
import { Heart, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Silently log in dev only
    if (import.meta.env.DEV) {
      console.warn('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center px-6"
          style={{ background: '#030712', fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          <div className="text-center max-w-md">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
            >
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-3">Something went wrong</h1>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              An unexpected error occurred. Please try refreshing the page or go back home.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold border border-white/10 hover:border-white/20 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
              >
                <Home className="w-4 h-4" /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
