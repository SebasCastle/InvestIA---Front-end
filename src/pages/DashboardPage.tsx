import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AssetRail } from '../components/AssetRail';
import { AllocationChart } from '../components/charts/AllocationChart';
import { BenchmarkChart } from '../components/charts/BenchmarkChart';
import { PlChart } from '../components/charts/PlChart';
import { PositionsTable } from '../components/PositionsTable';
import { PriceBanner } from '../components/PriceBanner';
import { RangePills, type ChartRange } from '../components/RangePills';
import { StateMessage } from '../components/StateMessage';
import { useApiData } from '../hooks/useApiData';
import { formatExecutionDate } from '../lib/dates';
import { formatMoney, formatPercent, toneClass } from '../lib/format';
import { notificationsService } from '../services/alerts.service';
import { insightsService } from '../services/insights.service';
import { portfolioService } from '../services/portfolio.service';
import { reportsService } from '../services/reports.service';
import type { AnalyticsReport } from '../types/insights';
import type { Summary, Transaction } from '../types/portfolio';

const tabs = ['Resumen', 'Posiciones', 'Movimientos', 'Analítica', 'Dividendos', 'Reportes'] as const;

export function DashboardPage() {
  const [range, setRange] = useState<ChartRange>('1Y');
  const [portfolioId, setPortfolioId] = useState('all');
  const [tab, setTab] = useState<(typeof tabs)[number]>('Resumen');
  const [mailState, setMailState] = useState<string | null>(null);
  const overview = useApiData(() => portfolioService.overview(range), `overview:${range}`);
  const selected = portfolioId === 'all' ? undefined : portfolioId;
  const analytics = useApiData(
    () => insightsService.analytics({ portfolioId: selected, range, benchmark: 'SPY' }),
    `dash-analytics:${selected ?? 'all'}:${range}`,
  );
  const transactions = useApiData(
    () => (selected ? portfolioService.transactions(selected) : Promise.resolve([])),
    `dash-tx:${selected ?? 'none'}`,
  );

  if (overview.loading) {
    return <p className="text-slate-500">Cargando panel...</p>;
  }
  if (overview.error || !overview.data) {
    return <StateMessage title="No se pudo cargar el panel" body={overview.error ?? 'Error'} action={<button type="button" onClick={overview.reload}>Reintentar</button>} />;
  }
  if (overview.data.portfolios.length === 0) {
    return (
      <StateMessage
        title="Todavía no hay portafolios"
        body="Crea el primero para ver valor, efectivo y resultados."
        action={<Link to="/portfolio">Crear portafolio</Link>}
      />
    );
  }

  const data = overview.data;
  const summary = selected
    ? data.portfolios.find((item) => item.id === selected)?.summary ?? null
    : data.summary;
  const currency = summary?.currency ?? data.currency ?? 'USD';

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xl font-semibold">
            <span className="sr-only">Portafolio</span>
            <select
              className="bg-transparent"
              value={portfolioId}
              onChange={(event) => setPortfolioId(event.target.value)}
            >
              <option value="all">Todos los portafolios</option>
              {data.portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
              ))}
            </select>
          </label>
          <RangePills value={range} onChange={setRange} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 text-sm">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`min-h-11 shrink-0 rounded-full px-3 ${tab === item ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'}`}
            >
              {item}
            </button>
          ))}
        </div>
        {!summary ? (
          <StateMessage title="Monedas distintas" body="Elige un portafolio. Los totales no se mezclan si las monedas no coinciden." />
        ) : (
          <>
            <PriceBanner status={summary.pricesStatus} error={summary.pricesError} />
            {tab === 'Resumen' ? <SummaryView summary={summary} currency={currency} analytics={analytics.data} /> : null}
            {tab === 'Posiciones' ? <PositionsTable positions={summary.positions} currency={currency} /> : null}
            {tab === 'Movimientos' ? <TransactionsView rows={transactions.data ?? []} loading={transactions.loading} dividendOnly={false} /> : null}
            {tab === 'Dividendos' ? <TransactionsView rows={(transactions.data ?? []).filter((row) => row.type === 'DIVIDEND')} loading={transactions.loading} dividendOnly /> : null}
            {tab === 'Analítica' ? <AnalyticsView currency={currency} analytics={analytics.data} loading={analytics.loading} error={analytics.error} /> : null}
            {tab === 'Reportes' ? <ReportsView portfolioId={selected} mailState={mailState} onMail={setMailState} /> : null}
          </>
        )}
      </div>
      <AssetRail currency={currency} />
    </div>
  );
}

function SummaryView({
  summary,
  currency,
  analytics,
}: {
  summary: Summary;
  currency: string;
  analytics: AnalyticsReport | null;
}) {
  const cards: { label: string; value: string; hint?: string; tone?: number | null }[] = [
    { label: 'Valor total', value: formatMoney(summary.portfolioValue, currency), hint: formatPercent(summary.returnPercent) },
    { label: 'Monto invertido', value: formatMoney(summary.investedAmount, currency) },
    { label: 'Efectivo disponible', value: formatMoney(summary.cash, currency) },
    { label: 'P/L total', value: formatMoney(summary.totalPl, currency), hint: formatPercent(summary.returnPercent), tone: summary.totalPl },
    { label: 'Cambio diario', value: summary.dailyChange === null ? '—' : formatMoney(summary.dailyChange, currency), hint: formatPercent(summary.dailyChangePercent), tone: summary.dailyChange },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, index) => (
          <motion.article
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#10192b]"
          >
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className="mt-2 break-words text-lg font-semibold tabular-nums sm:text-xl">{card.value}</p>
            {card.hint ? <p className={`text-sm tabular-nums ${toneClass(card.tone ?? null)}`}>{card.hint}</p> : null}
          </motion.article>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#10192b]">
        <h2 className="mb-3 font-semibold">Valor del portafolio vs S&P 500</h2>
        {analytics?.benchmark.available ? (
          <BenchmarkChart points={analytics.benchmark.points} />
        ) : (
          <p className="text-sm text-slate-500">{analytics?.benchmark.error ?? analytics?.pricesError ?? 'Aún no hay historia común con el benchmark.'}</p>
        )}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#10192b]">
          <h2 className="mb-3 font-semibold">Asignación de activos</h2>
          {summary.allocation.some((slice) => slice.value > 0) ? (
            <AllocationChart slices={summary.allocation.filter((slice) => slice.value > 0)} currency={currency} />
          ) : (
            <p className="text-sm text-slate-500">Sin posiciones abiertas.</p>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#10192b]">
          <h2 className="mb-3 font-semibold">Contribuidores y detractores</h2>
          {analytics && analytics.contributors.length + analytics.detractors.length > 0 ? (
            <PlChart rows={[...analytics.contributors, ...analytics.detractors]} currency={currency} />
          ) : (
            <p className="text-sm text-slate-500">Todavía no hay P/L por activo.</p>
          )}
        </section>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Mini label="Rendimiento" value={formatPercent(analytics?.benchmark.portfolioReturn ?? summary.returnPercent)} />
        <Mini label="Volatilidad" value={formatPercent(analytics?.risk.annualizedVolatility ?? null)} />
        <Mini label="Máx. drawdown" value={formatPercent(analytics?.risk.maxDrawdownPercent === null || analytics?.risk.maxDrawdownPercent === undefined ? null : -analytics.risk.maxDrawdownPercent)} />
        <Mini label="Sharpe" value={analytics?.risk.sharpeRatio?.toFixed(2) ?? '—'} />
        <Mini label="Beta vs SPY" value={analytics?.risk.beta?.toFixed(2) ?? '—'} />
      </div>
    </div>
  );
}

function AnalyticsView({
  currency,
  analytics,
  loading,
  error,
}: {
  currency: string;
  analytics: AnalyticsReport | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return <p className="text-sm text-slate-500">Calculando analítica...</p>;
  }
  if (error || !analytics) {
    return <p className="text-sm text-rose-700">{error ?? 'Sin analítica'}</p>;
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{analytics.risk.reason}</p>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#10192b]">
        {analytics.contributors.length + analytics.detractors.length > 0 ? (
          <PlChart rows={[...analytics.contributors, ...analytics.detractors]} currency={currency} />
        ) : (
          <p className="text-sm text-slate-500">Sin contribuidores.</p>
        )}
      </div>
    </div>
  );
}

function TransactionsView({
  rows,
  loading,
  dividendOnly,
}: {
  rows: Transaction[];
  loading: boolean;
  dividendOnly: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-slate-500">Cargando movimientos...</p>;
  }
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">{dividendOnly ? 'No hay dividendos en este portafolio.' : 'Elige un portafolio para ver sus movimientos.'}</p>;
  }
  return (
    <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#10192b]">
      {rows.slice(0, 12).map((row) => (
        <li key={row.id} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>{row.type} {row.asset ? `· ${row.asset.symbol}` : ''}</span>
          <span className="tabular-nums text-slate-500">{formatExecutionDate(row.executedAt)} · {formatMoney(row.price, row.currency)}</span>
        </li>
      ))}
    </ul>
  );
}

function ReportsView({
  portfolioId,
  mailState,
  onMail,
}: {
  portfolioId?: string;
  mailState: string | null;
  onMail: (value: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#10192b]">
      <p className="text-sm text-slate-500">El PDF y el Excel usan los cálculos del portafolio seleccionado.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!portfolioId || busy} className="rounded-lg bg-teal-800 px-3 py-2 text-sm text-white disabled:opacity-50" onClick={() => portfolioId && void reportsService.pdf(portfolioId, 'portafolio')}>PDF</button>
        <button type="button" disabled={!portfolioId || busy} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-white/10" onClick={() => portfolioId && void reportsService.xlsx(portfolioId, 'portafolio')}>Excel</button>
        <button
          type="button"
          disabled={busy}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-white/10"
          onClick={() => {
            setBusy(true);
            void notificationsService.dailyReport()
              .then((result) => onMail(result.sent ? 'Cierre enviado.' : (result.reason ?? 'No se envió.')))
              .catch((caught: unknown) => onMail(caught instanceof Error ? caught.message : 'No se pudo enviar'))
              .finally(() => setBusy(false));
          }}
        >
          Enviar cierre
        </button>
      </div>
      {mailState ? <p className="text-sm text-slate-500">{mailState}</p> : null}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#10192b]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
    </div>
  );
}

