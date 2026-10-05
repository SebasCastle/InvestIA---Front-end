import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney, formatPercent } from '../../lib/format';
import { useTheme } from '../../hooks/useTheme';
import { SERIES, tooltipProps } from './chart-theme';

export function AllocationChart({
  slices,
  currency,
}: {
  slices: { symbol: string; name: string; value: number; percent: number }[];
  currency: string;
}) {
  const { theme } = useTheme();
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[12rem_1fr]">
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="symbol" innerRadius={58} outerRadius={78} paddingAngle={3} stroke="transparent">
              {slices.map((slice, index) => (
                <Cell key={slice.symbol} fill={SERIES.slices[index % SERIES.slices.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipProps(theme)} formatter={(value) => formatMoney(Number(value ?? 0), currency)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-stone-500">Total</span>
          <span className="text-sm font-semibold tabular-nums">{formatMoney(total, currency)}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {slices.map((slice, index) => (
          <li key={slice.symbol} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: SERIES.slices[index % SERIES.slices.length] }} />
              {slice.symbol}
            </span>
            <span className="tabular-nums text-stone-500">{formatPercent(slice.percent)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
