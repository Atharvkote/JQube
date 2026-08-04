// JQube — ErrorBoundary Component (TSX)
// Note: React error boundaries REQUIRE class components (React 19).

import { Component, type ErrorInfo, type ReactNode } from 'react';
import ErrorPage from './error-page';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <ErrorPage
            code="500"
            title="Something went wrong"
            description={
              this.state.error?.message ?? 'An unexpected error occurred.'
            }
          />
        )
      );
    }
    return this.props.children;
  }
}
