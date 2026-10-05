import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { formatMoney } from '../../lib/format';
import type { Candle } from '../../services/market-data.service';
import { chartColors, SERIES, tooltipProps } from './chart-theme';

export function HistoryChart({ candles, currency }: { candles: Candle[]; currency: string }) {
  const { theme } = useTheme();
  const colors = chartColors(theme);
  return (
    <div className="h-52 w-full min-w-0 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={candles} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.axis, fontSize: 11 }} minTickGap={28} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: colors.axis, fontSize: 11 }}
            width={72}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => formatMoney(value, currency)}
          />
          <Tooltip
            {...tooltipProps(theme)}
            formatter={(value, name) => [formatMoney(Number(value ?? 0), currency), name === 'close' ? 'Cierre' : String(name)]}
          />
          <Area type="monotone" dataKey="close" name="close" stroke={SERIES.benchmark} fill={SERIES.benchmark} fillOpacity={0.16} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
