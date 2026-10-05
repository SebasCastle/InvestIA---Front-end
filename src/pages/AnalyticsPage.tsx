import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { ChatPanel } from '../components/ChatPanel';
import { StateMessage } from '../components/StateMessage';
import { useApiData } from '../hooks/useApiData';
import { portfolioService } from '../services/portfolio.service';

export function AnalyticsPage() {
  const overview = useApiData(() => portfolioService.overview(), 'analytics-portfolios');
  const [params] = useSearchParams();
  const [portfolioId, setPortfolioId] = useState(params.get('portfolioId') ?? 'pending');
  const fallback = overview.data?.aggregated ? 'all' : overview.data?.portfolios[0]?.id || '';
  const selected = portfolioId === 'pending' ? fallback : portfolioId;

  if (overview.loading) {
    return <p className="text-stone-500">Cargando análisis...</p>;
  }
  if (overview.error || !overview.data) {
    return <StateMessage title="No se pudo cargar el análisis" body={overview.error ?? 'Intenta de nuevo'} />;
  }
  if (overview.data.portfolios.length === 0) {
    return (
      <StateMessage
        title="Todavía no hay portafolios"
        body="Crea uno para ver benchmark, asignación y riesgo."
        action={
          <Link className="text-sm font-medium text-teal-800 dark:text-teal-300" to="/portfolio">
            Crear portafolio
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Análisis</h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">Historia, referencia, contribución y riesgo calculados en el servidor.</p>
        </div>
        <label className="text-sm font-medium">
          Portafolio
          <select
            className="field mt-1 min-h-11 w-full sm:w-56"
            value={selected}
            onChange={(event) => setPortfolioId(event.target.value)}
          >
            {overview.data.aggregated ? <option value="all">Todos</option> : null}
            {overview.data.portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <AnalyticsPanel portfolioId={selected === 'all' ? undefined : selected} />
      <ChatPanel />
    </div>
  );
}
