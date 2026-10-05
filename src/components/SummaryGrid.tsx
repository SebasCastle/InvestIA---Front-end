import { formatMoney, formatPercent, toneClass } from '../lib/format';
import type { Summary } from '../types/portfolio';
import { MetricCard } from './MetricCard';

export function SummaryGrid({ summary }: { summary: Summary }) {
  const currency = summary.currency;
  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
      <MetricCard label="Valor del portafolio" value={formatMoney(summary.portfolioValue, currency)} />
      <MetricCard label="Monto invertido" value={formatMoney(summary.investedAmount, currency)} />
      <MetricCard label="Efectivo" value={formatMoney(summary.cash, currency)} />
      <MetricCard
        label="Cambio diario"
        value={summary.dailyChange === null ? '—' : formatMoney(summary.dailyChange, currency)}
        hint={formatPercent(summary.dailyChangePercent)}
        hintClassName={toneClass(summary.dailyChange)}
      />
      <MetricCard
        label="P/L total"
        value={formatMoney(summary.totalPl, currency)}
        hint={`Realizado ${formatMoney(summary.realizedPl, currency)} · No realizado ${formatMoney(summary.unrealizedPl, currency)}`}
        hintClassName={toneClass(summary.totalPl)}
      />
      <MetricCard
        label="Rendimiento"
        value={formatPercent(summary.returnPercent)}
        hintClassName={toneClass(summary.returnPercent)}
      />
    </div>
  );
}
