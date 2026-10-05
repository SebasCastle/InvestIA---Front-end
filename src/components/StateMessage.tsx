import type { ReactNode } from 'react';

export function StateMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel border-dashed px-6 py-10 text-center">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600 dark:text-stone-400">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
