import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../hooks/useAuth';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e7eef6] text-stone-600 dark:bg-[#070d18] dark:text-stone-300">
        Cargando...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="grid min-h-screen bg-[#e7eef6] dark:bg-[#070d18] lg:grid-cols-2">
      <section className="hidden min-h-screen flex-col justify-between bg-[#0b1220] px-12 py-10 text-slate-100 lg:flex">
        <p className="text-lg font-semibold tracking-tight">InvestAI</p>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">
            Seguimiento claro de tus inversiones.
          </h1>
        </div>
        <p className="text-sm text-teal-200">Tu cuenta, bajo tu control.</p>
      </section>
      <section className="flex w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-lg font-semibold text-stone-900 dark:text-stone-100 lg:hidden">InvestAI</p>
            <ThemeToggle />
          </div>
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">{title}</h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">{footer}</p>
        </div>
      </section>
    </main>
  );
}
