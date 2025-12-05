// hooks/useErrorReporting.ts
'use client';

import { useCallback, useEffect } from 'react';

interface ErrorReportOptions {
  userId?: string;
  userEmail?: string;
  component?: string;
  context?: Record<string, unknown>;
}

export function useErrorReporting(options: ErrorReportOptions = {}) {
  const reportError = useCallback(async (error: Error, additionalContext?: Record<string, unknown>) => {
    try {
      await fetch('/api/support/auto-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_message: error.message,
          error_stack: error.stack,
          component_name: options.component,
          url: typeof window !== 'undefined' ? window.location.href : '',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          user_id: options.userId,
          user_email: options.userEmail,
          additional_context: {
            ...options.context,
            ...additionalContext
          }
        })
      });
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  }, [options]);

  // Set up global error handlers
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      reportError(error, { type: 'unhandled_rejection' });
    };

    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message);
      reportError(error, { 
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [reportError]);

  return { reportError };
}
