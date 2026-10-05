import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { SERIES, tooltipProps } from './chart-theme';

export function BenchmarkChart({
  points,
}: {
  points: { date: string; portfolio: number; benchmark: number }[];
}) {
  const { theme } = useTheme();
  const colors = tooltipProps(theme);

  return (
    <div className="h-56 w-full min-w-0 sm:h-64 lg:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#d3deeb'} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#93a4bd' : '#526680', fontSize: 11 }} minTickGap={28} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: theme === 'dark' ? '#93a4bd' : '#526680', fontSize: 11 }} width={42} axisLine={false} tickLine={false} />
          <Tooltip {...colors} formatter={(value, name) => [Number(value ?? 0).toFixed(2), name === 'portfolio' ? 'Portafolio' : 'S&P 500']} />
          <Area type="monotone" dataKey="portfolio" name="portfolio" stroke={SERIES.portfolio} fill={SERIES.portfolio} fillOpacity={0.16} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="benchmark" name="benchmark" stroke={SERIES.benchmark} dot={false} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
