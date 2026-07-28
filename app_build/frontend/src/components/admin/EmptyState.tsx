// app_build/frontend/src/components/admin/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}

export default function EmptyState({ title, message, icon: Icon, children }: EmptyStateProps) {
  return (
    <div className="admin-card-soft p-6 text-center flex flex-col items-center justify-center space-y-3">
      {Icon && <Icon className="w-12 h-12 text-hairline" />}
      <p className="text-sm font-medium text-ink">{title}</p>
      {message && <p className="text-sm text-muted max-w-xs">{message}</p>}
      {children}
    </div>
  );
}
