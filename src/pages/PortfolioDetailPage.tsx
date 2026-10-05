import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IntelligencePanel } from '../components/IntelligencePanel';
import { AllocationChart } from '../components/charts/AllocationChart';
import { HistoryChart } from '../components/charts/HistoryChart';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { PlChart } from '../components/charts/PlChart';
import { Button } from '../components/Button';
import { FormError } from '../components/FormError';
import { PositionsTable } from '../components/PositionsTable';
import { PriceBanner } from '../components/PriceBanner';
import { RangePills, type ChartRange } from '../components/RangePills';
import { SymbolSearch } from '../components/SymbolSearch';
import { StateMessage } from '../components/StateMessage';
import { SummaryGrid } from '../components/SummaryGrid';
import { TextField } from '../components/TextField';
import { useApiData } from '../hooks/useApiData';
import { executionTimestamp, formatExecutionDate } from '../lib/dates';
import { formatMoney, formatQuantity } from '../lib/format';
import { marketDataService, type SymbolHit, type TradingSession } from '../services/market-data.service';
import { portfolioService } from '../services/portfolio.service';
import { reportsService } from '../services/reports.service';
import type { AssetType, TransactionType } from '../types/portfolio';

const tradeTypes = new Set<TransactionType>(['BUY', 'SELL', 'DIVIDEND']);

export function PortfolioDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [range, setRange] = useState<ChartRange>('1Y');
  const [chartMode, setChartMode] = useState<'value' | 'percent'>('value');
  const portfolio = useApiData(() => portfolioService.get(id), `portfolio:${id}`);
  const performance = useApiData(() => portfolioService.performance(id, range), `performance:${id}:${range}`);
  const transactions = useApiData(() => portfolioService.transactions(id), `transactions:${id}`);
  const [type, setType] = useState<TransactionType>('DEPOSIT');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('STOCK');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [fees, setFees] = useState('0');
  const [executedAt, setExecutedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<'pdf' | 'xlsx' | null>(null);
  const [session, setSession] = useState<TradingSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [historySymbol, setHistorySymbol] = useState('');
  const history = useApiData(
    () =>
      historySymbol
        ? marketDataService.history(historySymbol, rangeStart(range), new Date().toISOString().slice(0, 10))
        : Promise.resolve({ symbol: '', prices: [] }),
    `asset-history:${historySymbol}:${range}`,
  );

  const needsAsset = tradeTypes.has(type);

  useEffect(() => {
    if (!needsAsset || !symbol || !executedAt) {
      setSession(null);
      setSessionError(null);
      return;
    }
    let active = true;
    void marketDataService
      .session(symbol, executedAt)
      .then((value) => {
        if (!active) {
          return;
        }
        setSession(value);
        setSessionError(null);
        if (value.close !== null) {
          setPrice(String(value.close));
        }
      })
      .catch((caught: unknown) => {
        if (!active) {
          return;
        }
        setSession(null);
        setSessionError(caught instanceof Error ? caught.message : 'No se pudo consultar el histórico');
      });
    return () => {
      active = false;
    };
  }, [needsAsset, symbol, executedAt]);

  function chooseSymbol(hit: SymbolHit) {
    setSymbol(hit.symbol);
    setName(hit.name || hit.symbol);
    setAssetType(assetTypeFrom(hit.type));
    setHistorySymbol(hit.symbol);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (needsAsset && !symbol) {
        setFormError('Elige un símbolo de la búsqueda');
        setSubmitting(false);
        return;
      }
      await portfolioService.createTransaction(id, {
        type,
        symbol: needsAsset ? symbol : undefined,
        name: needsAsset ? name : undefined,
        assetType: needsAsset ? assetType : undefined,
        quantity: needsAsset ? Number(quantity) : Number(amount),
        price: needsAsset ? Number(price) : 1,
        fees: Number(fees || 0),
        executedAt: executionTimestamp(executedAt),
      });
      setQuantity('');
      setPrice('');
      setAmount('');
      portfolio.reload();
      performance.reload();
      transactions.reload();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'No se pudo registrar el movimiento');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePortfolio() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await portfolioService.remove(id);
    navigate('/portfolio', { replace: true });
  }

  async function download(kind: 'pdf' | 'xlsx') {
    if (!portfolio.data) {
      return;
    }
    setDownloadError(null);
    setDownloading(kind);
    try {
      const slug = portfolio.data.name.replace(/\s+/g, '-').toLowerCase();
      if (kind === 'pdf') {
        await reportsService.pdf(portfolio.data.id, slug);
      } else {
        await reportsService.xlsx(portfolio.data.id, slug);
      }
    } catch (caught) {
      setDownloadError(caught instanceof Error ? caught.message : 'No se pudo descargar el informe');
    } finally {
      setDownloading(null);
    }
  }

  async function handleDeleteTransaction(transactionId: string) {
    await portfolioService.removeTransaction(id, transactionId);
    portfolio.reload();
    performance.reload();
    transactions.reload();
  }

  if (portfolio.loading) {
    return <p className="text-stone-500">Cargando portafolio...</p>;
  }
  if (portfolio.error || !portfolio.data) {
    return (
      <StateMessage
        title="No se pudo abrir el portafolio"
        body={portfolio.error ?? 'Portafolio no encontrado'}
        action={
          <Link className="text-sm font-medium text-teal-800 dark:text-teal-300" to="/portfolio">
            Volver
          </Link>
        }
      />
    );
  }

  const detail = portfolio.data;
  const summary = detail.summary;
  const allocation = summary.allocation.filter((slice) => slice.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-sm text-teal-800 dark:text-teal-300" to="/portfolio">
            Portafolios
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950 sm:text-3xl dark:text-stone-50">{detail.name}</h1>
          <p className="text-stone-500">{detail.currency}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={downloading !== null} className="text-sm font-medium text-teal-800 disabled:opacity-60 dark:text-teal-300" onClick={() => void download('pdf')}>
            {downloading === 'pdf' ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
          <button type="button" disabled={downloading !== null} className="text-sm font-medium text-teal-800 disabled:opacity-60 dark:text-teal-300" onClick={() => void download('xlsx')}>
            {downloading === 'xlsx' ? 'Generando Excel...' : 'Descargar Excel'}
          </button>
          <button
            type="button"
            onClick={() => void handleDeletePortfolio()}
            className="text-sm font-medium text-rose-700 dark:text-rose-400"
          >
            {confirmDelete ? 'Confirmar eliminación' : 'Eliminar portafolio'}
          </button>
        </div>
      </div>

      {downloadError ? <p className="text-sm text-rose-700 dark:text-rose-400">{downloadError}</p> : null}
      <PriceBanner status={summary.pricesStatus} error={summary.pricesError} />
      <SummaryGrid summary={summary} />

      <section className="panel p-4">
        <h2 className="mb-3 font-semibold">Rendimiento</h2>
        {performance.loading ? <p className="text-sm text-stone-500">Cargando gráfica...</p> : null}
        {performance.error ? <p className="text-sm text-rose-700">{performance.error}</p> : null}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <RangePills value={range} onChange={setRange} />
          <div className="flex gap-2 text-xs">
            <button type="button" className={chartMode === 'value' ? 'font-semibold' : 'text-stone-500'} onClick={() => setChartMode('value')}>Valor</button>
            <button type="button" className={chartMode === 'percent' ? 'font-semibold' : 'text-stone-500'} onClick={() => setChartMode('percent')}>Rendimiento %</button>
          </div>
        </div>
        {performance.data?.pricesError ? <p className="mb-3 text-sm text-amber-800 dark:text-amber-200">{performance.data.pricesError}</p> : null}
        {performance.data && performance.data.points.length > 1 ? (
          <PerformanceChart points={performance.data.points} currency={detail.currency} mode={chartMode} />
        ) : null}
        {performance.data && performance.data.points.length <= 1 ? (
          <p className="text-sm text-stone-500">Aún no hay suficiente historia para la gráfica.</p>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-4">
          <h2 className="mb-3 font-semibold">Asignación</h2>
          {allocation.length > 0 ? (
            <AllocationChart slices={allocation} currency={detail.currency} />
          ) : (
            <p className="text-sm text-stone-500">Sin posiciones abiertas.</p>
          )}
        </section>
        <section className="panel p-4">
          <h2 className="mb-3 font-semibold">P/L por activo</h2>
          {summary.plByAsset.length > 0 ? (
            <PlChart rows={summary.plByAsset} currency={detail.currency} />
          ) : (
            <p className="text-sm text-stone-500">Sin resultados por activo.</p>
          )}
        </section>
      </div>

      <section className="panel p-5">
        <h2 className="mb-3 font-semibold">Histórico del activo</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {summary.positions.filter((position) => position.quantity > 0 && position.asset).map((position) => (
            <button
              key={position.asset?.symbol}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-medium ${historySymbol === position.asset?.symbol ? 'bg-teal-800 text-white' : 'bg-stone-100 dark:bg-stone-800'}`}
              onClick={() => setHistorySymbol(position.asset?.symbol ?? '')}
            >
              {position.asset?.symbol}
            </button>
          ))}
        </div>
        {!historySymbol ? <p className="text-sm text-stone-500">Elige un símbolo para ver cierres reales.</p> : null}
        {history.loading && historySymbol ? <p className="text-sm text-stone-500">Cargando histórico...</p> : null}
        {history.error ? <p className="text-sm text-amber-800 dark:text-amber-200">{history.error}</p> : null}
        {history.data && history.data.prices.length > 1 ? (
          <HistoryChart candles={history.data.prices} currency={detail.currency} />
        ) : null}
        {history.data && historySymbol && !history.loading && history.data.prices.length <= 1 && !history.error ? (
          <p className="text-sm text-stone-500">No hay suficientes cierres para esa ventana.</p>
        ) : null}
      </section>

      <section className="panel p-5">
        <h2 className="mb-3 font-semibold">Posiciones y precios</h2>
        <PositionsTable positions={summary.positions} currency={detail.currency} />
      </section>

      <p className="text-sm">
        <Link className="font-medium text-teal-800 dark:text-teal-300" to={`/analytics?portfolioId=${detail.id}`}>
          Ver benchmark y riesgo de este portafolio
        </Link>
      </p>
      <IntelligencePanel portfolioId={detail.id} />

      <section className="panel p-4">
        <h2 className="mb-4 font-semibold">Nuevo movimiento</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
          <div className="md:col-span-2">
            <FormError message={formError} />
          </div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Tipo
            <select
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
              value={type}
              onChange={(event) => setType(event.target.value as TransactionType)}
            >
              <option value="DEPOSIT">Depósito</option>
              <option value="WITHDRAWAL">Retiro</option>
              <option value="BUY">Compra</option>
              <option value="SELL">Venta</option>
              <option value="DIVIDEND">Dividendo</option>
            </select>
          </label>
          <TextField label="Fecha" name="executedAt" type="date" required value={executedAt} onChange={(event) => setExecutedAt(event.target.value)} />
          {needsAsset ? (
            <>
              <SymbolSearch onSelect={chooseSymbol} />
              {symbol ? (
                <p className="text-sm text-stone-600 md:col-span-2 dark:text-stone-300">
                  Seleccionado <span className="font-semibold">{symbol}</span>
                  {name ? ` · ${name}` : ''}
                </p>
              ) : null}
              {sessionError ? <p className="text-sm text-amber-800 md:col-span-2 dark:text-amber-200">{sessionError}</p> : null}
              {session?.message ? <p className="text-sm text-stone-600 md:col-span-2 dark:text-stone-300">{session.message}</p> : null}
              {session?.close !== null && session ? (
                <div className="grid grid-cols-2 gap-2 text-sm md:col-span-2 sm:grid-cols-4">
                  <Ohlc label="Apertura" value={session.open} currency={detail.currency} />
                  <Ohlc label="Máximo" value={session.high} currency={detail.currency} />
                  <Ohlc label="Mínimo" value={session.low} currency={detail.currency} />
                  <Ohlc label="Cierre" value={session.close} currency={detail.currency} />
                </div>
              ) : null}
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Tipo de activo
                <select
                  className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
                  value={assetType}
                  onChange={(event) => setAssetType(event.target.value as AssetType)}
                >
                  <option value="STOCK">Acción</option>
                  <option value="ETF">ETF</option>
                  <option value="CRYPTO">Cripto</option>
                  <option value="FOREX">Divisa</option>
                  <option value="OTHER">Otro</option>
                </select>
              </label>
              <TextField label="Cantidad" name="quantity" type="number" min="0" step="any" required value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              <TextField label="Precio ejecutado" name="price" type="number" min="0" step="any" required value={price} onChange={(event) => setPrice(event.target.value)} />
            </>
          ) : (
            <TextField label="Monto" name="amount" type="number" min="0" step="any" required value={amount} onChange={(event) => setAmount(event.target.value)} />
          )}
          <TextField label="Comisiones" name="fees" type="number" min="0" step="any" value={fees} onChange={(event) => setFees(event.target.value)} />
          <div className="md:col-span-2 md:max-w-xs">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </section>

      <section className="panel p-4">
        <h2 className="mb-3 font-semibold">Movimientos</h2>
        {transactions.loading ? <p className="text-sm text-stone-500">Cargando movimientos...</p> : null}
        {transactions.error ? <p className="text-sm text-rose-700">{transactions.error}</p> : null}
        {!transactions.loading && transactions.data?.length === 0 ? (
          <p className="text-sm text-stone-500">No hay movimientos.</p>
        ) : null}
        <ul className="divide-y divide-stone-200 dark:divide-stone-800">
          {transactions.data?.map((transaction) => (
            <li key={transaction.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium">{labelFor(transaction.type)} {transaction.asset ? `· ${transaction.asset.symbol}` : ''}</p>
                <p className="text-stone-500">
                  {formatExecutionDate(transaction.executedAt)} · {formatQuantity(transaction.quantity)} × {formatMoney(transaction.price, transaction.currency)}
                </p>
              </div>
              <button
                type="button"
                className="text-rose-700 dark:text-rose-400"
                onClick={() => void handleDeleteTransaction(transaction.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function assetTypeFrom(type: string): AssetType {
  const value = type.toLowerCase();
  if (value.includes('etf') || value.includes('etp')) {
    return 'ETF';
  }
  if (value.includes('crypto')) {
    return 'CRYPTO';
  }
  if (value.includes('forex') || value.includes('fx')) {
    return 'FOREX';
  }
  return 'STOCK';
}

function rangeStart(range: ChartRange): string {
  const days: Record<ChartRange, number> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 182, '1Y': 365, ALL: 3650 };
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days[range]);
  return date.toISOString().slice(0, 10);
}

function Ohlc({ label, value, currency }: { label: string; value: number | null; currency: string }) {
  return (
    <div className="rounded-xl bg-stone-50 px-3 py-2 dark:bg-stone-950">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="font-medium tabular-nums">{value === null ? '—' : formatMoney(value, currency)}</p>
    </div>
  );
}

function labelFor(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    BUY: 'Compra',
    SELL: 'Venta',
    DIVIDEND: 'Dividendo',
    DEPOSIT: 'Depósito',
    WITHDRAWAL: 'Retiro',
  };
  return labels[type];
}
