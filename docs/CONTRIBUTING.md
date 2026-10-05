# Contribuir

## Cómo está organizado

- `backend/` es NestJS, Prisma y PostgreSQL.
- `frontend/` es React, Vite y Tailwind.
- `docs/` describe solo lo que el código hace hoy.

Los identificadores de código van en inglés. Los textos de la interfaz y los errores de la API van en español.

## Reglas que no se rompen

- El backend calcula cantidades, costos, P/L y rendimientos. La IA solo interpreta.
- Gemini no modifica movimientos.
- Cada consulta de datos de usuario filtra por el `userId` de la sesión.
- `MarketDataProvider` sigue desacoplado. Finnhub, FMP y DataBursátil implementan esa interfaz. El enrutador elige. El frontend no llama a un proveedor.
- Si falta una clave externa, la aplicación arranca y degrada esa función.
- Prisma se queda en la línea 6.19. No subas el cliente a 7 u 8.
- No commitees `backend/.env`, claves ni contraseñas reales.

## Antes de abrir un cambio

Desde `backend`:

```powershell
npx prisma validate
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

Si el cambio toca la interfaz, recorre la pantalla con carga, vacío y error, y en un ancho estrecho.

Actualiza el documento que corresponda: `API.md` si hay una ruta nueva, `DATABASE.md` si hay migración, `DEVELOPMENT.md` si hay una variable de entorno, y `ROADMAP.md` si una fase pasa a estar hecha.
