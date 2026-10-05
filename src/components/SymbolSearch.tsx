import { useEffect, useRef, useState } from 'react';
import { formatMoney, formatPercent, toneClass } from '../lib/format';
import { marketDataService, type SymbolHit } from '../services/market-data.service';

export function SymbolSearch({ onSelect }: { onSelect: (hit: SymbolHit) => void }) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SymbolHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const skipSearch = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }
    const term = query.trim();
    if (term.length < 1) {
      setHits([]);
      setError(null);
      setLoading(false);
      setOpen(false);
      return;
    }
    const handle = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void marketDataService
        .search(term)
        .then((rows) => {
          setHits(rows);
          setOpen(true);
        })
        .catch((caught: unknown) => {
          setHits([]);
          setError(caught instanceof Error ? caught.message : 'No se pudo buscar el símbolo');
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  function choose(hit: SymbolHit) {
    skipSearch.current = true;
    onSelect(hit);
    setQuery(hit.symbol);
    setHits([]);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative md:col-span-2">
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
        Buscar símbolo
        <input
          className="field mt-1.5 min-h-11 uppercase"
          value={query}
          placeholder="AAPL, MSFT, TSLA"
          autoComplete="off"
          onChange={(event) => {
            skipSearch.current = false;
            setQuery(event.target.value);
          }}
          onFocus={() => {
            if (hits.length > 0) {
              setOpen(true);
            }
          }}
        />
      </label>
      {loading ? <p className="mt-2 text-xs text-stone-500">Buscando...</p> : null}
      {error ? <p className="mt-2 text-xs text-rose-700 dark:text-rose-400">{error}</p> : null}
      {open && !loading && query.trim() && hits.length === 0 && !error ? (
        <p className="mt-2 text-xs text-stone-500">Sin coincidencias.</p>
      ) : null}
      {open && hits.length > 0 ? (
        <ul className="panel absolute z-30 mt-1 max-h-[40vh] w-full overflow-auto shadow-xl">
          {hits.map((hit) => (
            <li key={hit.symbol}>
              <button
                type="button"
                className="flex min-h-11 w-full items-start justify-between gap-3 px-3 py-2 text-left hover:bg-stone-50 dark:hover:bg-white/5"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(hit)}
              >
                <span>
                  <span className="font-semibold">{hit.symbol}</span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {hit.name}
                    {hit.exchange ? ` · ${hit.exchange}` : ''}
                    {hit.currency ? ` · ${hit.currency}` : ''}
                  </span>
                </span>
                <span className="text-right text-sm">
                  {hit.price !== null && hit.currency ? formatMoney(hit.price, hit.currency) : '—'}
                  <span className={`block text-xs ${toneClass(hit.changePercent)}`}>{formatPercent(hit.changePercent)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
