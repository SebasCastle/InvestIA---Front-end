import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { formatMoney, formatPercent } from '../../lib/format';
import { chartColors, SERIES, tooltipProps } from './chart-theme';

export function PerformanceChart({
  points,
  currency,
  mode,
}: {
  points: { date: string; value: number }[];
  currency: string;
  mode: 'value' | 'percent';
}) {
  const { theme } = useTheme();
  const colors = chartColors(theme);
  const base = points[0]?.value ?? 0;
  const data = points.map((point) => ({
    ...point,
    percent: base > 0 ? ((point.value - base) / base) * 100 : 0,
  }));

  return (
    <div className="h-56 w-full min-w-0 sm:h-64 lg:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.axis, fontSize: 11 }} minTickGap={28} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: colors.axis, fontSize: 11 }}
            width={72}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => (mode === 'value' ? formatMoney(value, currency) : `${value.toFixed(0)}%`)}
          />
          <Tooltip
            {...tooltipProps(theme)}
            formatter={(value, name) =>
              name === 'percent' ? formatPercent(Number(value ?? 0)) : formatMoney(Number(value ?? 0), currency)
            }
          />
          <Area
            type="monotone"
            dataKey={mode === 'value' ? 'value' : 'percent'}
            name={mode === 'value' ? 'Valor' : 'percent'}
            stroke={SERIES.portfolio}
            fill={SERIES.portfolio}
            fillOpacity={0.18}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
