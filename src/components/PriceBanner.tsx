import { useEffect } from 'react';
import { notifyError } from '../services/api';
import type { PricesStatus } from '../types/portfolio';

export function PriceBanner({ status, error }: { status: PricesStatus; error: string | null }) {
  useEffect(() => {
    if (status === 'unavailable' && error) {
      notifyError(error);
    }
  }, [status, error]);

  if (status === 'ok') {
    return null;
  }
  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
      {error ??
        (status === 'partial'
          ? 'Algunos precios no están disponibles. El valor usa el costo promedio donde falta cotización.'
          : 'Los precios de mercado no están disponibles. El valor mostrado usa el costo promedio.')}
    </p>
  );
}
