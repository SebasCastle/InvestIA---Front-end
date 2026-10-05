# Roadmap

## Hecho

### Fase 1 — esqueleto

Monorepo con NestJS y React. Carpetas de auth, usuarios, portafolio, activos, movimientos, mercado, analítica y los módulos reservados. Panel básico y cliente HTTP.

### Fase 2 — datos

Prisma con usuarios, portafolios, activos, posiciones y movimientos. Migración inicial.

### Fase 3 — sesión

Registro, login y perfil. JWT, bcrypt y rutas privadas. El hash no sale de la API.

### Fase 4 — motor de portafolio

CRUD de portafolios, catálogo de activos y libro de movimientos. Tipos `BUY`, `SELL`, `DIVIDEND`, `DEPOSIT` y `WITHDRAWAL`. Posiciones reconstruidas en el servidor. Aislamiento por usuario. Pruebas de cálculo y de transacciones.

### Fase 5 — mercado

`MarketDataProvider`, Finnhub, caché, `lastUpdated` y degradación si falta un precio. La clave solo vive en el entorno. El motor no depende de Finnhub.

### Fase 6 — panel

Valor, invertido, efectivo, cambio diario, P/L, rendimiento, posiciones y precios. Gráficas de desempeño, asignación y P/L por activo. Rutas `/portfolio` y `/portfolio/:id`. Tema claro y oscuro.

### Fase 7 — inteligencia de mercado

Noticias, perfil y fundamentales sobre `MarketDataProvider`. Finnhub los implementa. El módulo `intelligence` solo pide datos de los activos que el usuario tiene en cartera.

### Fase 8 — analista

Gemini recibe herramientas de lectura: portafolio, posiciones, movimientos, cotizaciones, desempeño, asignación, benchmark, noticias y fundamentales. El backend calcula las cifras. La IA no puede registrar ni borrar movimientos. El chat vive en el panel.

### Fase 9 — analítica

Historia, comparación contra un símbolo de referencia, asignación, contribuidores y detractores, y riesgo cuando hay suficientes observaciones. Ruta `/analytics`, con periodo y referencia.

### Fase 10 — informes

PDF y Excel de un portafolio propio: resumen, posiciones, movimientos, P/L, asignación, analítica y noticias. Rutas de descarga en el detalle del portafolio.

### Fase 11 — correo y cron

SMTP con nodemailer. Cierre diario con valor, rendimiento, posiciones resumidas en el texto, contribuidores, detractores, noticias y una interpretación opcional de Gemini. Cron configurable. Cada envío usa solo los portafolios de ese usuario. Sin SMTP o sin clave de IA la aplicación sigue en pie.

### Fase 12 — cierre

Alertas de precio y de rendimiento, casco HTTP, límite de solicitudes, filtro de errores y pruebas de aislamiento. La interfaz cubre carga, vacío y error en las pantallas nuevas.

## Hecho después del cierre

FMP aporta el histórico EOD de Estados Unidos. DataBursátil aporta cotizaciones, cierre e importe de BMV y BIVA. `MarketDataRouter` elige según el símbolo y no traga un 401. El panel usa barra lateral, cinta de índices, KPI y ficha del activo. El Sharpe y la beta solo aparecen cuando la serie real alcanza cinco observaciones.
