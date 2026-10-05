# API

Base: `http://localhost:3000/api`.

Las rutas distintas de registro e inicio de sesión exigen:

```http
Authorization: Bearer <accessToken>
```

El cuerpo es JSON, salvo las descargas de informe. Un campo desconocido responde `400`. Los identificadores de ruta que no son UUID también responden `400`.

Hay un límite de 120 solicitudes por minuto. Registro e inicio de sesión admiten 10 por minuto. Si se supera, la respuesta es `429` con el mensaje `Demasiadas solicitudes. Espera un momento.` Un error no controlado responde `500` con `No se pudo completar la solicitud`.

El usuario público nunca incluye `passwordHash`:

```json
{
  "id": "uuid",
  "email": "ana@example.com",
  "firstName": "Ana",
  "lastName": "López"
}
```

## Autenticación

### `POST /auth/register` · 201

```json
{
  "email": "ana@example.com",
  "password": "al-menos-8",
  "firstName": "Ana",
  "lastName": "López"
}
```

Respuesta: `{ "user", "accessToken" }`. El correo se normaliza a minúsculas. Un correo repetido responde `409`.

### `POST /auth/login` · 200

```json
{ "email": "ana@example.com", "password": "al-menos-8" }
```

Misma forma de respuesta. Credenciales incorrectas: `401`.

### `GET /auth/me` · 200

Devuelve el usuario público de la sesión.

## Portafolios

Todas exigen sesión. Un portafolio de otro usuario responde `404`.

| Método | Ruta | Resultado |
| --- | --- | --- |
| `GET` | `/portfolios` | Lista con resumen de cada portafolio del usuario. |
| `GET` | `/portfolios/overview` | Totales para el panel. |
| `POST` | `/portfolios` | Crea y responde datos básicos, sin resumen. |
| `GET` | `/portfolios/:id` | Datos del portafolio más `summary`. |
| `GET` | `/portfolios/:id/performance?range=` | Serie diaria. |
| `PATCH` | `/portfolios/:id` | Cambia nombre y, si no hay movimientos, moneda. |
| `DELETE` | `/portfolios/:id` | `204` sin cuerpo. |

Crear:

```json
{ "name": "Largo plazo", "currency": "USD" }
```

`currency` son de 3 a 10 letras. Se guarda en mayúsculas.

`range` acepta `1M`, `3M`, `1Y` y `ALL`. Si falta o no es válido, se usa `1Y`. Cada punto trae fecha, valor, costo y resultado.

### Resumen

`summary` y cada elemento de la lista incluyen:

- `cash`, `investedAmount`, `marketValue`, `portfolioValue`
- `realizedPl`, `unrealizedPl`, `totalPl`
- `depositsIn`, `returnPercent`
- `dailyChange`, `dailyChangePercent`
- `pricesStatus` (`ok`, `partial`, `unavailable`) y `pricesError`
- `positions`, `allocation`, `plByAsset`

`overview` agrega esos totales solo cuando todos los portafolios usan la misma moneda. Si hay monedas distintas, `aggregated` es `false` y `summary` es `null`. La lista de portafolios sigue presente.

Una posición incluye símbolo, cantidad, costo promedio, valor de mercado, P/L, `priceAvailable` y `lastUpdated`.

## Activos

Catálogo global. Cualquier usuario autenticado puede leerlo. Crear un símbolo que ya existe con otra moneda responde `409`.

| Método | Ruta | Resultado |
| --- | --- | --- |
| `GET` | `/assets` | Lista. `?symbol=AAPL` filtra. |
| `GET` | `/assets/:id` | Uno. `404` si no existe. |
| `POST` | `/assets` | Crea o devuelve el existente si símbolo y moneda coinciden. |

```json
{
  "symbol": "AAPL",
  "name": "Apple",
  "type": "STOCK",
  "exchange": "US",
  "currency": "USD"
}
```

`type`: `STOCK`, `ETF`, `CRYPTO`, `FOREX`, `OTHER`.

Los movimientos de compra, venta y dividendo crean el activo si todavía no existe. No hace falta llamar este endpoint antes de operar.

## Movimientos

Base: `/portfolios/:portfolioId/transactions`.

| Método | Ruta | Resultado |
| --- | --- | --- |
| `GET` | `/` | Libro del portafolio, del más reciente al más antiguo. |
| `GET` | `/:id` | Un movimiento. |
| `POST` | `/` | Registra y recalcula posiciones. |
| `DELETE` | `/:id` | `204` y vuelve a calcular. |

```json
{
  "type": "BUY",
  "symbol": "AAPL",
  "name": "Apple",
  "assetType": "STOCK",
  "exchange": "US",
  "quantity": 10,
  "price": 50,
  "fees": 0,
  "executedAt": "2026-10-01T15:00:00.000Z"
}
```

`BUY`, `SELL` y `DIVIDEND` exigen `symbol`, `name` y `assetType`. `DEPOSIT` y `WITHDRAWAL` no llevan activo: la cantidad es el importe y el precio es `1` en la interfaz. `fees` es opcional y por defecto `0`. `executedAt` es una fecha ISO.

Errores de negocio, como vender de más o no tener efectivo, responden `400` y no dejan el movimiento guardado.

## Datos de mercado

| Método | Ruta | Resultado |
| --- | --- | --- |
| `GET` | `/market-data/search?q=` | Coincidencias con símbolo, nombre, exchange, moneda, precio y variación. |
| `GET` | `/market-data/quotes?symbols=AAPL,MSFT` | Cotizaciones. Entre 1 y 50 símbolos. |
| `GET` | `/market-data/history/:symbol?from=&to=` | Velas diarias OHLC. Sin fechas, el último año. |
| `GET` | `/market-data/history/:symbol/session?date=` | OHLC de esa fecha, o el cierre anterior si no hubo sesión. |
| `GET` | `/market-data/profile/:symbol` | Perfil de la empresa. |

`quotes` no falla entero si un símbolo no responde. Devuelve:

```json
{
  "quotes": {},
  "pricesStatus": "unavailable",
  "error": "mensaje"
}
```

Cada cotización trae `price`, `change`, `changePercent` y `lastUpdated`. El histórico sin datos responde `503`. El perfil ausente o un proveedor caído responde el estado que indique `MarketDataError`, en general `404` o `503`.

Sin `FINNHUB_API_KEY`, `FMP_API_KEY` ni `DATABURSATIL_TOKEN`, las rutas de mercado informan que el proveedor no está configurado. El resto de la API sigue disponible.

Si todos los proveedores configurados para esa consulta fallan, la respuesta es `503` con `Por ahora no fue posible obtener los datos de mercado. Intenta de nuevo en unos minutos.` El backend distingue 401, 403, 404, 429, 5xx, timeout y red solo en el log. Un 401 no pasa al siguiente proveedor. La interfaz no muestra el nombre del proveedor, el status ni la pila, y no repite el aviso si varias piezas piden el mismo dato a la vez.

### Noticias y fundamentales

| Método | Ruta | Resultado |
| --- | --- | --- |
| `GET` | `/market-data/news/:symbol` | Hasta diez notas recientes, con `lastUpdated`. |
| `GET` | `/market-data/fundamentals/:symbol` | Capitalización, P/E, P/B, EPS, dividendo, beta y rango de 52 semanas. Un campo ausente llega como `null`. |
| `GET` | `/intelligence` | Perfil, fundamentales y noticias de los activos del usuario. |
| `GET` | `/intelligence?portfolioId=` | Lo mismo, limitado a un portafolio propio. Uno ajeno responde `404`. |

## Analítica

`GET /analytics?portfolioId=&range=1Y&benchmark=SPY`

`range` acepta `1D`, `1W`, `1M`, `3M`, `6M`, `1Y` y `ALL`. `benchmark` es un símbolo de hasta 20 caracteres. Sin `portfolioId`, agrega los portafolios solo si comparten moneda. Si no, `aggregated` es `false` y no hay totales.

La respuesta incluye la serie de valor, la comparación indexada a 100, asignación, contribuidores, detractores y riesgo. La volatilidad anual y el Sharpe aparecen a partir de cinco variaciones diarias. La beta contra el benchmark exige al menos cinco pares. Sin observaciones, esas métricas quedan en `null`. Sin posiciones, la concentración queda en `null`.

## Analista

`POST /ai/chat`

```json
{
  "message": "¿Cómo va el portafolio frente a SPY?",
  "history": [{ "role": "user", "content": "Hola" }]
}
```

`history` es opcional, máximo 12 turnos. La respuesta es `{ "reply", "toolsUsed" }`. Las herramientas solo leen datos del usuario autenticado. No existe una herramienta para crear o borrar movimientos. Sin `GEMINI_API_KEY` la ruta responde `503` y el resto de la API sigue disponible.

## Informes

| Método | Ruta | Resultado |
| --- | --- | --- |
| `GET` | `/reports/portfolios/:id/pdf` | PDF adjunto. |
| `GET` | `/reports/portfolios/:id/xlsx` | Libro de Excel. |

Un portafolio ajeno o inexistente responde `404`. El archivo incluye resumen, posiciones, asignación, movimientos, analítica de un año contra `SPY` y noticias de los activos de ese portafolio. Si faltan precios o la referencia, el informe se genera igual y marca esos datos como no disponibles.

## Alertas

| Método | Ruta | Resultado |
| --- | --- | --- |
| `GET` | `/alerts` | Alertas del usuario, de la más reciente a la más antigua. |
| `POST` | `/alerts` | Crea una alerta. |
| `DELETE` | `/alerts/:id` | `204`. Una alerta ajena responde `404`. |

```json
{ "kind": "PRICE_ABOVE", "symbol": "AAPL", "threshold": 200 }
```

```json
{ "kind": "RETURN_BELOW", "portfolioId": "uuid", "threshold": -5 }
```

`kind` es `PRICE_ABOVE`, `PRICE_BELOW`, `RETURN_ABOVE` o `RETURN_BELOW`. El precio exige `symbol` (1 a 20 caracteres). El rendimiento exige `portfolioId` de un portafolio propio. `threshold` es numérico. La respuesta incluye `id`, `kind`, `symbol`, `threshold`, `enabled`, `lastTriggeredAt`, `createdAt` y `portfolio` (`id` y `name`, o `null`).

## Cierre por correo

`POST /notifications/daily-report` · 200

Envía el cierre solo de los portafolios del usuario autenticado. La respuesta es `{ "sent": true }` o `{ "sent": false, "reason": "..." }`. Sin SMTP, `reason` es `El correo no está configurado` y el código sigue siendo `200`. Sin portafolios, `reason` es `No hay portafolios para informar`. El cron usa la misma construcción y no expone otro endpoint.
