import { useEffect, useState } from 'react';
import { formatMoney, formatPercent, toneClass } from '../lib/format';
import { marketDataService, type SymbolHit } from '../services/market-data.service';
import type { Fundamentals, NewsArticle } from '../types/insights';
import { ChatPanel } from './ChatPanel';
import { SymbolSearch } from './SymbolSearch';

export function AssetRail({ currency }: { currency: string }) {
  const [hit, setHit] = useState<SymbolHit | null>(null);
  const [fundamentals, setFundamentals] = useState<Fundamentals | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hit) {
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    void Promise.allSettled([
      marketDataService.fundamentals(hit.symbol),
      marketDataService.news(hit.symbol),
    ]).then(([fund, articles]) => {
      if (!active) {
        return;
      }
      setFundamentals(fund.status === 'fulfilled' ? fund.value : null);
      setNews(articles.status === 'fulfilled' ? articles.value.articles.slice(0, 4) : []);
      if (fund.status === 'rejected' && articles.status === 'rejected') {
        setError('No hay ficha para este símbolo.');
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [hit]);

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#10192b]">
        <h2 className="text-sm font-semibold">Buscar activo</h2>
        <div className="mt-3">
          <SymbolSearch onSelect={setHit} />
        </div>
      </section>
      {hit ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#10192b]">
          <p className="text-xs text-slate-500">{hit.exchange || 'Mercado'} · {hit.currency || currency}</p>
          <h3 className="mt-1 text-lg font-semibold">{hit.symbol}</h3>
          <p className="text-sm text-slate-500">{hit.name}</p>
          <p className="mt-3 text-2xl font-semibold tabular-nums">
            {hit.price !== null ? formatMoney(hit.price, hit.currency || currency) : '—'}
          </p>
          <p className={`text-sm tabular-nums ${toneClass(hit.changePercent)}`}>{formatPercent(hit.changePercent)}</p>
          {loading ? <p className="mt-3 text-xs text-slate-500">Cargando ficha...</p> : null}
          {error ? <p className="mt-3 text-xs text-amber-700 dark:text-amber-200">{error}</p> : null}
          {fundamentals ? (
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Market cap" value={fundamentals.marketCap === null ? '—' : formatMoney(fundamentals.marketCap, hit.currency || currency)} />
              <Row label="P/E" value={fundamentals.peRatio?.toFixed(2) ?? '—'} />
              <Row label="Beta" value={fundamentals.beta?.toFixed(2) ?? '—'} />
              <Row
                label="52 semanas"
                value={
                  fundamentals.week52Low !== null && fundamentals.week52High !== null
                    ? `${fundamentals.week52Low.toFixed(2)} – ${fundamentals.week52High.toFixed(2)}`
                    : '—'
                }
              />
            </dl>
          ) : null}
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-white/10">
          Busca AAPL, MSFT o una emisora como WALMEX* para ver precio y noticias.
        </p>
      )}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#10192b]">
        <h2 className="text-sm font-semibold">Últimas noticias</h2>
        {news.length === 0 ? <p className="mt-3 text-sm text-slate-500">Sin notas recientes.</p> : null}
        <ul className="mt-3 space-y-3">
          {news.map((article) => (
            <li key={article.id}>
              <a href={article.url || undefined} className="text-sm font-medium hover:underline" target="_blank" rel="noreferrer">
                {article.headline}
              </a>
              <p className="text-xs text-slate-500">{article.source}</p>
            </li>
          ))}
        </ul>
      </section>
      <ChatPanel />
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
