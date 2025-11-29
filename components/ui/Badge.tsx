import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20',
    outline: 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400 bg-transparent',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};