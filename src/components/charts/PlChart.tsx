import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { formatMoney } from '../../lib/format';
import { chartColors, SERIES, tooltipProps } from './chart-theme';

export function PlChart({
  rows,
  currency,
}: {
  rows: { symbol: string; name: string; pl: number }[];
  currency: string;
}) {
  const { theme } = useTheme();
  const colors = chartColors(theme);

  return (
    <div className="h-56 w-full min-w-0 sm:h-64 lg:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey="symbol" tick={{ fill: colors.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: colors.axis, fontSize: 11 }}
            width={72}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => formatMoney(value, currency)}
          />
          <Tooltip
            {...tooltipProps(theme)}
            cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }}
            formatter={(value, _name, item) => {
              const payload = item.payload as { name?: string };
              return [`${formatMoney(Number(value ?? 0), currency)}${payload.name ? ` · ${payload.name}` : ''}`, 'P/L'];
            }}
          />
          <Bar dataKey="pl" name="P/L" radius={[8, 8, 0, 0]}>
            {rows.map((row) => (
              <Cell key={row.symbol} fill={row.pl >= 0 ? SERIES.positive : SERIES.negative} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
