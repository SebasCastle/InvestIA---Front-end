import { useState } from 'react';
import { AllocationChart } from './charts/AllocationChart';
import { BenchmarkChart } from './charts/BenchmarkChart';
import { PlChart } from './charts/PlChart';
import { useApiData } from '../hooks/useApiData';
import { formatPercent } from '../lib/format';
import { insightsService } from '../services/insights.service';

const ranges = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;

export function AnalyticsPanel({ portfolioId }: { portfolioId?: string }) {
  const [range, setRange] = useState<(typeof ranges)[number]>('1Y');
  const [benchmark, setBenchmark] = useState('SPY');
  const [appliedBenchmark, setAppliedBenchmark] = useState('SPY');
  const report = useApiData(
    () => insightsService.analytics({ portfolioId, range, benchmark: appliedBenchmark }),
    `analytics:${portfolioId ?? 'all'}:${range}:${appliedBenchmark}`,
  );
  const data = report.data;

  return (
    <section className="space-y-4">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setAppliedBenchmark(benchmark.trim().toUpperCase() || 'SPY');
        }}
      >
        <label className="text-sm font-medium">
          Periodo
          <select
            className="mt-1 block rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
            value={range}
            onChange={(event) => setRange(event.target.value as (typeof ranges)[number])}
          >
            {ranges.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Referencia
          <input
            className="mt-1 block w-28 rounded-lg border border-stone-300 bg-white px-3 py-2 uppercase dark:border-stone-700 dark:bg-stone-950"
            value={benchmark}
            onChange={(event) => setBenchmark(event.target.value)}
          />
        </label>
        <button type="submit" className="rounded-lg bg-teal-800 px-3 py-2 text-sm font-semibold text-white dark:bg-teal-700">
          Aplicar
        </button>
      </form>

      {report.loading ? <p className="text-sm text-stone-500">Calculando analítica...</p> : null}
      {report.error ? <p className="text-sm text-rose-700 dark:text-rose-400">{report.error}</p> : null}
      {data && !data.aggregated ? (
        <p className="text-sm text-stone-500">Elige un portafolio. Las monedas distintas no se agregan.</p>
      ) : null}
      {data && data.aggregated && data.currency ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Rendimiento" value={formatPercent(data.benchmark.portfolioReturn)} />
            <Stat label={data.benchmarkSymbol} value={formatPercent(data.benchmark.benchmarkReturn)} />
            <Stat label="Exceso" value={formatPercent(data.benchmark.excessReturn)} />
          </div>
          <div className="panel p-4">
            <h2 className="mb-3 font-semibold">Portafolio contra {data.benchmarkSymbol}</h2>
            {data.benchmark.available ? (
              <BenchmarkChart points={data.benchmark.points} />
            ) : (
              <p className="text-sm text-stone-500">{data.benchmark.error ?? 'No hay historia común con la referencia.'}</p>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-4">
              <h2 className="mb-3 font-semibold">Asignación</h2>
              {data.allocation.length > 0 ? (
                <AllocationChart slices={data.allocation} currency={data.currency} />
              ) : (
                <p className="text-sm text-stone-500">Sin posiciones abiertas.</p>
              )}
            </div>
            <div className="panel p-4">
              <h2 className="mb-3 font-semibold">Contribuidores y detractores</h2>
              {data.contributors.length + data.detractors.length > 0 ? (
                <PlChart rows={[...data.contributors, ...data.detractors]} currency={data.currency} />
              ) : (
                <p className="text-sm text-stone-500">Todavía no hay P/L por activo.</p>
              )}
            </div>
          </div>
          <div className="panel p-4">
            <h2 className="mb-3 font-semibold">Riesgo y diversificación</h2>
            {data.risk.reason ? <p className="mb-3 text-sm text-stone-500">{data.risk.reason}</p> : null}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Volatilidad anual" value={formatPercent(data.risk.annualizedVolatility)} />
              <Stat label="Caída máxima" value={formatPercent(data.risk.maxDrawdownPercent === null ? null : -data.risk.maxDrawdownPercent)} />
              <Stat label="Posiciones efectivas" value={data.risk.effectivePositions?.toFixed(2) ?? '—'} />
              <Stat label="Mayor peso" value={formatPercent(data.risk.largestWeight)} />
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
