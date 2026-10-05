import { useState, type FormEvent } from 'react';
import { FormError } from '../components/FormError';
import { StateMessage } from '../components/StateMessage';
import { useApiData } from '../hooks/useApiData';
import { alertsService, type AlertKind } from '../services/alerts.service';
import { portfolioService } from '../services/portfolio.service';

const labels: Record<AlertKind, string> = {
  PRICE_ABOVE: 'Precio por encima',
  PRICE_BELOW: 'Precio por debajo',
  RETURN_ABOVE: 'Rendimiento por encima',
  RETURN_BELOW: 'Rendimiento por debajo',
};

export function AlertsPage() {
  const alerts = useApiData(() => alertsService.list(), 'alerts');
  const portfolios = useApiData(() => portfolioService.list(), 'alert-portfolios');
  const [kind, setKind] = useState<AlertKind>('PRICE_ABOVE');
  const [symbol, setSymbol] = useState('');
  const [portfolioId, setPortfolioId] = useState('');
  const [threshold, setThreshold] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const needsSymbol = kind.startsWith('PRICE');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await alertsService.create({
        kind,
        threshold: Number(threshold),
        symbol: needsSymbol ? symbol : undefined,
        portfolioId: needsSymbol ? undefined : portfolioId,
      });
      setThreshold('');
      alerts.reload();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'No se pudo crear la alerta');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Alertas</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Avisos de precio o rendimiento. Si el correo no está configurado, la alerta queda registrada y no se envía.
        </p>
      </div>
      <form className="panel grid gap-3 p-4 md:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
        <div className="md:col-span-2">
          <FormError message={formError} />
        </div>
        <label className="text-sm font-medium">
          Tipo
          <select className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-950" value={kind} onChange={(event) => setKind(event.target.value as AlertKind)}>
            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        {needsSymbol ? (
          <label className="text-sm font-medium">
            Símbolo
            <input className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 uppercase dark:border-stone-700 dark:bg-stone-950" required value={symbol} onChange={(event) => setSymbol(event.target.value)} />
          </label>
        ) : (
          <label className="text-sm font-medium">
            Portafolio
            <select className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-950" required value={portfolioId} onChange={(event) => setPortfolioId(event.target.value)}>
              <option value="">Elige uno</option>
              {portfolios.data?.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
              ))}
            </select>
          </label>
        )}
        <label className="text-sm font-medium">
          Umbral {needsSymbol ? '' : '(%)'}
          <input className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-950" required type="number" step="any" value={threshold} onChange={(event) => setThreshold(event.target.value)} />
        </label>
        <button type="submit" disabled={submitting} className="self-end rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-teal-700">
          {submitting ? 'Guardando...' : 'Crear alerta'}
        </button>
      </form>
      {alerts.loading ? <p className="text-sm text-stone-500">Cargando alertas...</p> : null}
      {alerts.error ? <StateMessage title="No se pudieron cargar las alertas" body={alerts.error} action={<button type="button" className="text-sm text-teal-800 dark:text-teal-300" onClick={alerts.reload}>Reintentar</button>} /> : null}
      {listError ? <p className="text-sm text-rose-700 dark:text-rose-400">{listError}</p> : null}
      {alerts.data && alerts.data.length === 0 ? <p className="text-sm text-stone-500">Todavía no hay alertas.</p> : null}
      <ul className="space-y-2">
        {alerts.data?.map((alert) => (
          <li key={alert.id} className="flex flex-wrap items-center justify-between gap-3 panel p-4">
            <div>
              <p className="font-medium">{labels[alert.kind]}</p>
              <p className="text-sm text-stone-500">
                {alert.symbol ?? alert.portfolio?.name ?? 'Portafolio'} · umbral {alert.threshold}
                {alert.lastTriggeredAt ? ` · avisada ${new Date(alert.lastTriggeredAt).toLocaleString('es-MX')}` : ''}
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-rose-700 dark:text-rose-400"
              onClick={() => {
                setListError(null);
                void alertsService.remove(alert.id).then(() => alerts.reload()).catch((caught: unknown) => {
                  setListError(caught instanceof Error ? caught.message : 'No se pudo eliminar la alerta');
                });
              }}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
