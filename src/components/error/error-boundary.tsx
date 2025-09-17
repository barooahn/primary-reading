'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Report error to monitoring service (if available)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default child-friendly error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Oops! Something went wrong 😔
              </CardTitle>
              <CardDescription className="text-lg">
                Don&apos;t worry! This happens sometimes. Let&apos;s try to fix it together.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Child-friendly explanation */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">What happened?</h3>
                <p className="text-blue-800 text-sm">
                  The app ran into a small problem and couldn&apos;t show what you wanted to see.
                  It&apos;s like when a book page gets stuck - we just need to turn to a fresh page!
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="lg"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
              </div>

              {/* Error details for debugging (only in development) */}
              {this.props.showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 p-4 bg-gray-100 rounded-lg border">
                  <summary className="cursor-pointer font-medium text-gray-700 flex items-center">
                    <Bug className="h-4 w-4 mr-2" />
                    Technical Details (for developers)
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Error:</h4>
                      <pre className="mt-1 text-sm bg-red-50 p-2 rounded border text-red-800 overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <h4 className="font-semibold text-gray-900">Component Stack:</h4>
                        <pre className="mt-1 text-sm bg-gray-50 p-2 rounded border text-gray-700 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">Error ID:</h4>
                      <code className="mt-1 text-sm bg-gray-50 p-2 rounded border text-gray-700 block">
                        {this.state.errorId}
                      </code>
                    </div>
                  </div>
                </details>
              )}

              {/* Help message */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  If this keeps happening, please ask a grown-up to contact support
                  and mention error ID: <code className="bg-gray-100 px-1 rounded">{this.state.errorId}</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook for functional components to access error boundary
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: string) => {
    console.error('Manual error reported:', error, errorInfo);

    // Re-throw error to be caught by error boundary
    throw error;
  };
};

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} showDetails={process.env.NODE_ENV === 'development'}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};