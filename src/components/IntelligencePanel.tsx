import { useApiData } from '../hooks/useApiData';
import { formatMoney, formatPercent } from '../lib/format';
import { insightsService } from '../services/insights.service';

export function IntelligencePanel({ portfolioId }: { portfolioId?: string }) {
  const { data, error, loading, reload } = useApiData(
    () => insightsService.intelligence(portfolioId),
    `intelligence:${portfolioId ?? 'all'}`,
  );

  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold">Activos, perfil y noticias</h2>
        <button type="button" className="text-sm text-teal-800 dark:text-teal-300" onClick={reload}>
          Actualizar
        </button>
      </div>
      {loading ? <p className="text-sm text-stone-500">Cargando inteligencia de mercado...</p> : null}
      {error ? <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p> : null}
      {data && data.assets.length === 0 ? (
        <p className="text-sm text-stone-500">Las noticias aparecen cuando hay activos en cartera.</p>
      ) : null}
      <div className="space-y-4">
        {data?.assets.map((item) => (
          <article key={item.asset.id} className="border-t border-stone-200 pt-4 dark:border-stone-800">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-medium">
                {item.asset.symbol} <span className="text-stone-500">{item.profile?.name ?? item.asset.name}</span>
              </h3>
              <p className="text-xs text-stone-500">{item.profile?.industry ?? item.asset.type}</p>
            </div>
            {item.error ? <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{item.error}</p> : null}
            {item.fundamentals ? (
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <Metric label="P/E" value={item.fundamentals.peRatio?.toFixed(2) ?? '—'} />
                <Metric label="Beta" value={item.fundamentals.beta?.toFixed(2) ?? '—'} />
                <Metric label="Dividendo" value={formatPercent(item.fundamentals.dividendYield)} />
                <Metric
                  label="Capitalización"
                  value={item.fundamentals.marketCap === null ? '—' : formatMoney(item.fundamentals.marketCap, item.asset.currency || 'USD')}
                />
              </dl>
            ) : null}
            <ul className="mt-3 space-y-2">
              {item.news.length === 0 ? <li className="text-sm text-stone-500">Sin noticias recientes.</li> : null}
              {item.news.slice(0, 3).map((article) => (
                <li key={article.id}>
                  <a className="text-sm font-medium text-teal-800 hover:underline dark:text-teal-300" href={article.url} target="_blank" rel="noreferrer">
                    {article.headline}
                  </a>
                  <p className="text-xs text-stone-500">
                    {article.source} · {new Date(article.publishedAt).toLocaleDateString('es-MX')}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
