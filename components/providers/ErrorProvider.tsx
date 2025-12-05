// components/providers/ErrorProvider.tsx
'use client';

import React, { ReactNode } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useErrorReporting } from '@/hooks/useErrorReporting';

interface ErrorProviderProps {
  children: ReactNode;
  userId?: string;
  userEmail?: string;
}

function ErrorReportingInitializer({ userId, userEmail }: { userId?: string; userEmail?: string }) {
  useErrorReporting({ userId, userEmail });
  return null;
}

export default function ErrorProvider({ children, userId, userEmail }: ErrorProviderProps) {
  return (
    <ErrorBoundary>
      <ErrorReportingInitializer userId={userId} userEmail={userEmail} />
      {children}
    </ErrorBoundary>
  );
}
