export const CHART_RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;
export type ChartRange = (typeof CHART_RANGES)[number];

export function RangePills({
  value,
  onChange,
}: {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {CHART_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          className={`min-h-9 rounded-full px-2.5 py-1 text-xs font-medium ${
            value === range
              ? 'bg-teal-800 text-white dark:bg-teal-600'
              : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
