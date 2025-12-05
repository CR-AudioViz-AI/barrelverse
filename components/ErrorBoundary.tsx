// components/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  ticketSubmitted: boolean;
  ticketId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      ticketSubmitted: false,
      ticketId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Auto-submit error ticket
    try {
      const response = await fetch('/api/support/auto-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_message: error.message,
          error_stack: error.stack,
          component_name: errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown',
          url: typeof window !== 'undefined' ? window.location.href : '',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          additional_context: {
            componentStack: errorInfo.componentStack?.substring(0, 1000)
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.setState({ 
          ticketSubmitted: true, 
          ticketId: data.ticket_id 
        });
      }
    } catch (e) {
      console.error('Failed to submit error ticket:', e);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      ticketSubmitted: false,
      ticketId: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-stone-900 border border-stone-700 rounded-2xl p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-stone-400 mb-6">
              We've encountered an unexpected error. Don't worry - our team has been automatically notified.
            </p>

            {/* Ticket Status */}
            {this.state.ticketSubmitted && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-sm">
                  ✅ Error report submitted automatically
                  {this.state.ticketId && (
                    <span className="block text-xs mt-1 text-green-500/70">
                      Ticket #{this.state.ticketId.substring(0, 8)}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-stone-800 rounded-lg p-4 mb-6 text-left">
                <p className="text-red-400 text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-lg font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>

            {/* Contact Support */}
            <div className="mt-6 pt-6 border-t border-stone-700">
              <Link 
                href="/help"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
