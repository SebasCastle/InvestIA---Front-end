import { useState } from 'react';
import { AssetRail } from '../components/AssetRail';

export function MarketPage() {
  const [currency] = useState('USD');
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Mercado</h1>
        <p className="mt-1 text-sm text-slate-500">
          Las cotizaciones salen de Finnhub. El histórico de Estados Unidos usa FMP cuando está configurado. Las emisoras BMV y BIVA usan DataBursátil.
        </p>
      </div>
      <AssetRail currency={currency} />
    </div>
  );
}
