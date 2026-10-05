export function MetricCard({
  label,
  value,
  hint,
  hintClassName = 'text-stone-500 dark:text-stone-400',
}: {
  label: string;
  value: string;
  hint?: string;
  hintClassName?: string;
}) {
  return (
    <article className="panel p-4">
      <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold tracking-tight text-stone-950 tabular-nums sm:text-2xl dark:text-stone-50">{value}</p>
      {hint ? <p className={`mt-1 text-sm ${hintClassName}`}>{hint}</p> : null}
    </article>
  );
}
