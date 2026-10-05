export const SERIES = {
  portfolio: '#2dd4bf',
  benchmark: '#60a5fa',
  positive: '#34d399',
  negative: '#fb7185',
  slices: ['#38bdf8', '#a78bfa', '#fbbf24', '#34d399', '#fb7185', '#94a3b8', '#f97316'],
};

export function tooltipProps(theme: 'light' | 'dark') {
  const colors = chartColors(theme);
  return {
    contentStyle: {
      background: colors.tooltip,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      color: colors.tooltipText,
      boxShadow: '0 12px 32px rgb(0 0 0 / 35%)',
      fontSize: 12,
      lineHeight: 1.4,
      fontFamily: 'Segoe UI, system-ui, sans-serif',
    },
    labelStyle: { color: colors.tooltipText, fontWeight: 600 },
    itemStyle: { color: colors.tooltipText },
    wrapperStyle: { outline: 'none', zIndex: 40 },
  };
}

export function chartColors(theme: 'light' | 'dark') {
  return {
    axis: theme === 'dark' ? '#93a4bd' : '#526680',
    grid: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#d3deeb',
    tooltip: theme === 'dark' ? '#0c1424' : '#ffffff',
    tooltipText: theme === 'dark' ? '#e8eef8' : '#0f172a',
    border: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#d3deeb',
  };
}
