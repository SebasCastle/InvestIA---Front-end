# Desarrollo

## Variables

`backend/.env` se copia desde `backend/.env.example`. No se commitea.

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Postgres. En local: `postgresql://postgres:postgres@127.0.0.1:5433/investai?schema=public` |
| `JWT_SECRET` | Firma del access token. Obligatorio al arrancar. |
| `JWT_EXPIRES_IN` | Duración, por ejemplo `7d`. |
| `PORT` | Puerto HTTP. Por defecto `3000`. |
| `FRONTEND_URL` | Origen permitido por CORS. Por defecto `http://localhost:5173`. |
| `FINNHUB_API_KEY` | Clave de Finnhub. Cotizaciones, noticias y perfil. |
| `FMP_API_KEY` | Clave de Financial Modeling Prep. Histórico EOD y respaldo de cotizaciones. Vacía no tumba la app. |
| `DATABURSATIL_TOKEN` | Token de DataBursátil. Emisoras BMV/BIVA e IPC. Vacío no tumba la app. |
| `MARKET_DATA_PROVIDER` | `finnhub`, `fmp`, `databursatil` o `composite`. Sin ninguna clave, el proveedor queda no disponible. |
| `MARKET_DATA_CACHE_TTL_SECONDS` | TTL del caché en memoria. Por defecto `60`. |
| `GEMINI_API_KEY` | Clave de Gemini. Vacía deja el chat desactivado y el cierre sin interpretación. |
| `GEMINI_MODEL` | Modelo. Por defecto `gemini-2.0-flash`. |
| `SMTP_HOST` | Servidor SMTP. Vacío, junto con `MAIL_FROM`, deja el correo desactivado. |
| `SMTP_PORT` | Puerto. Por defecto `587`. `465` usa TLS implícito. |
| `SMTP_USER` | Usuario SMTP. Si se define, `SMTP_PASS` también es obligatorio. |
| `SMTP_PASS` | Contraseña SMTP. No se escribe en los logs. |
| `MAIL_FROM` | Remitente. Sin este valor el correo no se considera configurado. |
| `DAILY_REPORT_ENABLED` | Distinto de `false` programa el cierre. |
| `DAILY_REPORT_CRON` | Expresión cron. Por defecto `0 22 * * 1-5`. |
| `ALERTS_ENABLED` | Distinto de `false` programa la revisión de alertas. |
| `ALERT_CRON` | Por defecto `0 * * * *`. |
| `ALERT_COOLDOWN_HOURS` | Horas entre avisos de la misma alerta. Por defecto `24`. |
| `REPORT_TIMEZONE` | Zona de los cron. Por defecto `America/Mexico_City`. |

`frontend/.env`:

```text
VITE_API_URL=http://localhost:3000/api
```

La clave de Finnhub no se expone al navegador.

## Docker

```powershell
npm run db:up
```

Levanta `postgres:16-alpine` como `investai-postgres`, con usuario `postgres`, contraseña `postgres`, base `investai` y volumen `investai_pg_data`. El puerto del host es `5433`.

Esas credenciales son solo para la base local.

## Comandos

Desde la raíz:

```powershell
npm run dev:backend
npm run dev:frontend
npm run db:up
npm run db:migrate
```

Desde `backend`:

```powershell
npx prisma validate
npx prisma generate
npx tsc --noEmit -p tsconfig.json
npm test
npm run test:e2e
npm run build
```

Desde `frontend`:

```powershell
npx tsc -b
npm run build
```

`npm run build` del backend ejecuta `prisma generate` y después `nest build`. El del frontend ejecuta `tsc -b` y `vite build`.

Prisma se mantiene en la línea 6.19. Las versiones 7 y 8 cambian la forma del cliente. `@nestjs/jwt`, `@nestjs/passport` y `@nestjs/config` están fijados en las majors que Jest puede cargar con `require` en Node 22. `overrides.deepmerge-ts` en `backend/package.json` queda en `8.0.2`.

## Pruebas

No hace falta Postgres para la suite actual. Los e2e sustituyen Prisma por un almacén en memoria y cubren registro, login y `/auth/me`.

| Archivo | Qué cubre |
| --- | --- |
| `portfolio-calculator.spec.ts` | Depósito, compra, venta, dividendo, efectivo, realizado, no realizado, rendimiento y cambio diario. |
| `portfolio.service.spec.ts` | Alta, lectura, dueño y bloqueo de moneda. |
| `transactions.service.spec.ts` | Compra después de depositar, venta por encima de la cantidad y portafolio ajeno. |
| `market-data.service.spec.ts` | Caché y fallo parcial de cotizaciones. |
| `finnhub.provider.spec.ts` | Mapeo de quote y velas, y mensajes distintos para 401, 403, 429 y 500 sin filtrar la clave. |
| `session.spec.ts` | Cierre del día, día sin sesión y ausencia de precio inventado. |
| `auth.service.spec.ts`, `users.service.spec.ts` | Credenciales y usuario público. |
| `test/app.e2e-spec.ts` | HTTP de autenticación y `401` en informes, alertas y cierre sin sesión. |
| `intelligence.service.spec.ts` | Activos del usuario y fallo de mercado sin perder el activo. |
| `analytics-calculator.spec.ts` | Benchmark, contribuidores, drawdown y volatilidad insuficiente. |
| `ai.service.spec.ts`, `ai.tools.spec.ts`, `gemini.client.spec.ts` | Lectura de herramientas, rechazo de escrituras y clave fuera del error. |
| `report-document.spec.ts` | El texto del informe usa cifras calculadas y los archivos empiezan como PDF y Excel. |
| `mail.service.spec.ts` | Sin SMTP no se envía y no se lanza una excepción. |
| `daily-report.service.spec.ts` | Cada correo contiene solo el cierre de ese usuario. |
| `alert.rules.spec.ts`, `alerts.service.spec.ts` | Umbral, enfriamiento y borrado ajeno en `404`. |

El caso de referencia del calculador: depósito de 1000, compra de 10 a 50, venta de 4 a 60, dividendo de 6 a 1 y marca de 60 con cambio de 2. Resultado: efectivo 746, invertido 300, mercado 360, valor 1106, realizado 46, no realizado 60, P/L total 106, rendimiento 10.60, cambio diario 12, cantidad 6 y promedio 50.

## Interfaz

Tema oscuro por defecto y claro disponible. En pantallas de menos de 1024 px la barra lateral se sustituye por una navegación inferior: Dashboard, Portafolios, Analítica y Más. Las tarjetas pasan a una columna en teléfonos y a dos en tabletas. Las gráficas bajan de altura en pantallas estrechas. El buscador cierra la lista al elegir un símbolo y no vuelve a abrirla por el mismo texto. Las gráficas comparten tooltip con fondo, texto, borde y sombra explícitos. Los scrollbars son finos en todo el panel. El dashboard muestra KPI, portafolio contra benchmark, riesgo, posiciones y la ficha del activo. Sin claves de mercado el panel indica que el precio no está disponible y valúa al costo. `/market` busca símbolos. `/profile` muestra la sesión. El detalle del portafolio descarga PDF y Excel y sugiere el cierre de la fecha de compra, editable. `/alerts` crea, lista y borra umbrales. La navegación se adapta en pantallas estrechas.

## Problemas frecuentes

- `P1000` o credenciales rechazadas: la URL debe usar `127.0.0.1:5433`. `localhost` puede caer en un Postgres distinto del puerto 5432.
- `prisma migrate dev` pide confirmación por el índice único: en CI o sin TTY, aplica con `npx prisma migrate deploy`.
- El proveedor de mercado desconocido detiene el arranque. Usa `finnhub`, `fmp`, `databursatil` o `composite`.
- El cierre responde que el correo no está configurado cuando faltan `SMTP_HOST` o `MAIL_FROM`. La API y la interfaz siguen funcionando.
- Una expresión cron inválida queda en el log de arranque y no detiene Nest.
- En el log, `Market data failed for SPY` con status 403: la clave de Finnhub es válida y `/quote` responde, pero `/stock/candle` no está en el plan. La interfaz solo dice que por ahora no fue posible obtener los datos. El histórico de Estados Unidos usa FMP si `FMP_API_KEY` está definida.
- Una emisora `WALMEX*` o `ALSEA.MX` sin `DATABURSATIL_TOKEN` responde que requiere DataBursátil. No se pide ese histórico a Finnhub.
