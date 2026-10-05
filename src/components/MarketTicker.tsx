import { useEffect, useState } from 'react';
import { formatPercent, toneClass } from '../lib/format';
import { marketDataService } from '../services/market-data.service';

const symbols = [
  { symbol: 'SPY', label: 'S&P 500' },
  { symbol: 'QQQ', label: 'NASDAQ' },
  { symbol: 'DIA', label: 'DOW JONES' },
  { symbol: 'IPC', label: 'BMV IPC' },
];

type Tick = { symbol: string; label: string; price: number; changePercent: number };

export function MarketTicker() {
  const [ticks, setTicks] = useState<Tick[]>([]);

  useEffect(() => {
    let active = true;
    void marketDataService
      .quotes(symbols.map((item) => item.symbol))
      .then((result) => {
        if (!active) {
          return;
        }
        setTicks(
          symbols.flatMap((item) => {
            const quote = result.quotes[item.symbol];
            return quote ? [{ ...item, price: quote.price, changePercent: quote.changePercent }] : [];
          }),
        );
      })
      .catch(() => {
        if (active) {
          setTicks([]);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 text-xs dark:border-white/10 dark:bg-[#0c1424]">
      {ticks.length === 0 ? <span className="text-slate-500">Cargando índices...</span> : null}
      {ticks.map((tick) => (
        <span key={tick.symbol} className="flex shrink-0 items-center gap-2">
          <span className="text-slate-500">{tick.label}</span>
          <span className="font-medium tabular-nums">{tick.price.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</span>
          <span className={`tabular-nums ${toneClass(tick.changePercent)}`}>{formatPercent(tick.changePercent)}</span>
        </span>
      ))}
    </div>
  );
}
