# LANCHA YA! — Iquitos

Aplicación full stack para consultar salidas fluviales desde Iquitos, administrar empresas y salidas, y registrar reservas de pasajes.

## Tecnologías
- Frontend: React 18, Vite y React Router.
- Backend: Node.js 22+, Express 4 y SQLite (`node:sqlite`).
- Comunicación: API REST con `fetch`.
- Persistencia: SQLite, inicializada con los 12 registros de `backend/src/data/salidas.json`.

## Funcionalidades
### Pasajeros
- Consulta de salidas y filtros por destino, fecha, tipo, empresa/embarcación y rango de precio.
- Orden por fecha, precio o duración; accesos rápidos a salidas de hoy y próximas 48 horas.
- Paginación, detalle de salida, cuenta regresiva, indicador de cupos y compartir por WhatsApp.
- Reserva de pasajes con validación de DNI y generación de código `LY-XXXXX`.
- Consulta de reserva mediante su código.

### Administración
- CRUD de salidas y empresas fluviales.
- Asociación de salidas con empresas registradas.
- Protección para impedir borrar empresas con salidas futuras.
- Gestión del estado de las salidas: programada, abordando, zarpó y cancelada.
- Cancelación de reservas por API y devolución automática de cupos.
- Panel de estadísticas de salidas por destino y tipo, pasajes reservados y precio promedio por destino.

### Calidad
- Validaciones en frontend y backend.
- Middleware de registro de método, ruta, estado y tiempo de respuesta.
- Respuestas de error uniformes `{ "error": true, "mensaje": "..." }`.
- Configuración mediante `.env`.
- Colección Postman en `backend/postman/LanchaYa.postman_collection.json`.

## Requisitos
Node.js 22 o superior y npm.

## Instalación y ejecución

### 1. Backend
```bash
cd backend
npm install
```
Copia `.env.example` como `.env` y revisa la configuración. Luego:
```bash
npm run dev
```
La API estará en `http://localhost:3000`.

### 2. Frontend
En otra terminal:
```bash
cd frontend
npm install
```
Copia `frontend/.env.example` como `frontend/.env` si necesitas cambiar la URL de la API. Ejecuta:
```bash
npm run dev
```
Abre la URL que indique Vite (normalmente `http://localhost:5173`).

Para compilar el frontend:
```bash
npm run build
```

## Rutas de la aplicación
- `/` — consulta de salidas.
- `/salidas/:id` — detalle y reserva.
- `/reserva` — consulta de reserva por código.
- `/admin` — administración de salidas y estados.
- `/empresas` — gestión de empresas.
- `/panel` — estadísticas.

## API REST

| Método | Endpoint | Función |
|---|---|---|
| GET | `/api/salidas` | Lista, filtros, búsqueda, orden y paginación opcional `page`/`limit` |
| GET | `/api/salidas/:id` | Detalle de salida y ocupación |
| POST | `/api/salidas` | Crear salida |
| PUT | `/api/salidas/:id` | Actualizar salida |
| DELETE | `/api/salidas/:id` | Eliminar salida |
| GET | `/api/destinos` | Destinos sin repetir |
| GET/POST | `/api/empresas` | Listar y registrar empresas |
| PUT/DELETE | `/api/empresas/:id` | Actualizar y eliminar empresa |
| GET | `/api/empresas/:id/salidas` | Salidas de una empresa |
| POST | `/api/salidas/:id/reservas` | Registrar reserva |
| GET | `/api/salidas/:id/reservas` | Listar reservas de una salida |
| DELETE | `/api/reservas/:id` | Cancelar reserva y devolver cupos |
| GET | `/api/reservas/:codigo` | Consultar reserva por código |
| PATCH | `/api/salidas/:id/estado` | Cambiar estado de salida |
| GET | `/api/estadisticas` | Datos para panel |
| GET | `/api/health` | Estado del servidor |

Filtros de salidas: `destino`, `fecha`, `tipo`, `q`, `precioMin`, `precioMax`, `orden`, `dir`, `hoy`, `proximas48`. Para paginar: `page=1&limit=6`.

## Datos de demostración
Las empresas, precios y horarios que vienen en `salidas.json` son datos de ejemplo. Deben verificarse con los operadores fluviales antes de usarse para comprar o reservar pasajes reales.
