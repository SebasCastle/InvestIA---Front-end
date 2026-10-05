import type { ButtonHTMLAttributes } from 'react';

export function Button({
  className = '',
  fullWidth = true,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-700 dark:hover:bg-teal-600 ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    />
  );
}
