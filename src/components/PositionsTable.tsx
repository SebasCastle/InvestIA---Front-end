import { formatMoney, formatQuantity, toneClass } from '../lib/format';
import type { Position } from '../types/portfolio';

export function PositionsTable({ positions, currency }: { positions: Position[]; currency: string }) {
  const open = positions.filter((position) => position.quantity > 0);
  if (open.length === 0) {
    return <p className="text-sm text-stone-500">Todavía no hay posiciones abiertas.</p>;
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {open.map((position) => (
          <li key={position.asset?.id ?? position.asset?.symbol} className="panel space-y-2 p-4">
            <div>
              <p className="font-semibold">{position.asset?.symbol}</p>
              <p className="text-xs text-stone-500">{position.asset?.name}</p>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <Item label="Cantidad" value={formatQuantity(position.quantity)} />
              <Item label="Costo" value={formatMoney(position.averageCost, currency)} />
              <Item label="Precio" value={position.marketPrice === null ? 'No disponible' : formatMoney(position.marketPrice, currency)} />
              <Item label="Valor" value={formatMoney(position.marketValue, currency)} />
            </dl>
            <p className={`text-sm font-medium ${toneClass(position.totalPl)}`}>{formatMoney(position.totalPl, currency)}</p>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[40rem] w-full text-left text-sm tabular-nums">
          <thead className="text-xs tracking-wide text-stone-500 uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Activo</th>
              <th className="px-3 py-2 text-right font-medium">Cantidad</th>
              <th className="px-3 py-2 text-right font-medium">Costo prom.</th>
              <th className="px-3 py-2 text-right font-medium">Precio</th>
              <th className="px-3 py-2 text-right font-medium">Valor</th>
              <th className="px-3 py-2 text-right font-medium">P/L</th>
            </tr>
          </thead>
          <tbody>
            {open.map((position) => (
              <tr key={position.asset?.id ?? position.asset?.symbol} className="border-t border-white/10">
                <td className="px-3 py-3">
                  <p className="font-medium">{position.asset?.symbol}</p>
                  <p className="text-stone-500">{position.asset?.name}</p>
                </td>
                <td className="px-3 py-3 text-right">{formatQuantity(position.quantity)}</td>
                <td className="px-3 py-3 text-right">{formatMoney(position.averageCost, currency)}</td>
                <td className="px-3 py-3 text-right">
                  {position.priceAvailable && position.marketPrice !== null ? formatMoney(position.marketPrice, currency) : 'No disponible'}
                </td>
                <td className="px-3 py-3 text-right">{formatMoney(position.marketValue, currency)}</td>
                <td className={`px-3 py-3 text-right ${toneClass(position.totalPl)}`}>{formatMoney(position.totalPl, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
