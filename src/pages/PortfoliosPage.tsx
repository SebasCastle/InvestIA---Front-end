import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { FormError } from '../components/FormError';
import { StateMessage } from '../components/StateMessage';
import { TextField } from '../components/TextField';
import { useApiData } from '../hooks/useApiData';
import { formatMoney, formatPercent, toneClass } from '../lib/format';
import { portfolioService } from '../services/portfolio.service';

export function PortfoliosPage() {
  const { data, error, loading, reload } = useApiData(() => portfolioService.list(), 'portfolios');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await portfolioService.create({ name, currency });
      setName('');
      reload();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'No se pudo crear el portafolio');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-stone-950 dark:text-stone-50">Portafolios</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">Crea y abre cada cuenta de inversión.</p>
      </div>

      <form
        className="panel grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_140px_auto] lg:items-end"
        onSubmit={(event) => void handleCreate(event)}
      >
        <FormError message={formError} />
        <TextField label="Nombre" name="name" required value={name} onChange={(event) => setName(event.target.value)} />
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Moneda
          <select
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-950"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          >
            <option value="USD">USD</option>
            <option value="MXN">MXN</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
        <Button type="submit" disabled={submitting} className="min-h-11 sm:col-span-2 lg:col-span-1">
          {submitting ? 'Creando...' : 'Crear'}
        </Button>
      </form>

      {loading ? <p className="text-stone-500">Cargando portafolios...</p> : null}
      {error ? (
        <StateMessage
          title="No se pudieron cargar los portafolios"
          body={error}
          action={
            <button type="button" className="text-sm font-medium text-teal-800 dark:text-teal-300" onClick={reload}>
              Reintentar
            </button>
          }
        />
      ) : null}
      {!loading && !error && data?.length === 0 ? (
        <StateMessage title="Sin portafolios" body="Usa el formulario para crear el primero." />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {data?.map((portfolio) => (
          <Link
            key={portfolio.id}
            to={`/portfolio/${portfolio.id}`}
            className="panel p-4 transition hover:border-teal-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">{portfolio.name}</h2>
                <p className="text-sm text-stone-500">{portfolio.currency}</p>
              </div>
              <p className="font-medium">{formatMoney(portfolio.summary.portfolioValue, portfolio.currency)}</p>
            </div>
            <p className={`mt-3 text-sm ${toneClass(portfolio.summary.totalPl)}`}>
              {formatPercent(portfolio.summary.returnPercent)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
