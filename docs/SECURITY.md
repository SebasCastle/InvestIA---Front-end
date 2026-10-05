# Seguridad

## Sesión

El registro y el login devuelven un JWT. La contraseña se guarda con bcrypt y `passwordHash` no sale en ninguna respuesta. El correo se normaliza a minúsculas. El token del navegador vive en `localStorage` bajo `investai.accessToken`. Las rutas de la API, salvo registro y login, exigen `Authorization: Bearer`.

`JWT_SECRET` es obligatorio al arrancar y no tiene un valor de producción en el repositorio. `backend/.env` no se commitea.

## Aislamiento

Portafolios, movimientos, informes, analítica, inteligencia, chat y alertas filtran por el `userId` del token.

- Un recurso de otro usuario responde `404`, no `403`.
- Borrar una alerta usa `deleteMany` con `id` y `userId`.
- El cierre automático recorre usuarios y construye cada correo solo con los portafolios de ese `id`.
- Las herramientas de Gemini reciben el mismo `userId`. No hay una herramienta de escritura.

## Límites y errores

`helmet` añade cabeceras HTTP. El límite global es 120 solicitudes por minuto. Registro e inicio de sesión admiten 10. En pruebas (`NODE_ENV=test`) el límite no aplica, para que la suite no dependa del reloj.

`ValidationPipe` rechaza campos desconocidos. Un UUID inválido responde `400`. El filtro global conserva el estado y el mensaje de `HttpException`. Cualquier otra excepción se registra sin secretos y responde `500` con `No se pudo completar la solicitud`.

## Integraciones

| Secreto | Dónde viaja | Si falta |
| --- | --- | --- |
| `FINNHUB_API_KEY` | Parámetro `token` de Finnhub | Esa fuente se omite. La app arranca. |
| `FMP_API_KEY` | Parámetro `apikey` de FMP | El histórico EOD de esa fuente se omite. |
| `DATABURSATIL_TOKEN` | Parámetro `token` de DataBursátil | Las emisoras mexicanas quedan sin precio de esa fuente. |
| `GEMINI_API_KEY` | Encabezado `x-goog-api-key` | Chat `503`. El cierre sale sin interpretación. |
| `SMTP_PASS` | Auth del transporte, solo si hay usuario | El envío responde que el correo no está configurado. |

Ninguna de esas claves se incluye en los mensajes de error. Una alerta que no puede leer el precio se omite. Una expresión cron inválida no detiene el proceso.
