# Consulta de Riesgo Financiero — MVP

API REST segura (Node.js + TypeScript + JWT) y SPA (React + TypeScript) para consultar el *score* crediticio de un RUT con control de acceso por roles (`admin` / `user`).

## Requisitos

- Node.js >= 20 (ver `.nvmrc`)
- npm >= 10

## Ejecutar en local

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm install
npm run dev
```

- API: http://localhost:3000
- Web: http://localhost:5173

## Credenciales de prueba (mock)

| Usuario    | Contraseña   | Rol     | RUT propio     |
|------------|--------------|---------|----------------|
| `admin`    | `admin123`   | `admin` | —              |
| `usuario`  | `usuario123` | `user`  | `12.345.678-5` |
| `usuario2` | `usuario123` | `user`  | `11.111.111-1` |

Las contraseñas se guardan como hash scrypt en `backend/src/data/users.mock.ts`.

> El RUT de ejemplo del enunciado (`12.345.678-9`) tiene un dígito verificador inválido; la API responde `400 INVALID_RUT` para ese valor. El RUT válido equivalente es `12.345.678-5`.

```bash
curl -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"usuario","password":"usuario123"}'
```

```bash
curl http://localhost:3000/score/12.345.678-5 \
  -H 'Authorization: Bearer <token>'
```

## Estructura

```
backend/    API REST (Express + TypeScript)
frontend/   SPA (Vite + React + TypeScript)
```

## Contrato de la API

El contrato está definido en OpenAPI 3.1: [backend/openapi.yaml](backend/openapi.yaml).

| Método | Ruta           | Auth   | Respuestas               |
|--------|----------------|--------|--------------------------|
| POST   | `/login`       | —      | 200, 400, 401            |
| GET    | `/score/{rut}` | Bearer | 200, 400, 401, 403       |

Reglas de autorización para `GET /score/{rut}`:

- `admin`: puede consultar cualquier RUT.
- `user`: solo su propio RUT (claim `rut` del token). Otro RUT → `403 FORBIDDEN_RUT`.

Orden de evaluación: autenticación (`401`) → validación del RUT (`400`) → autorización (`403`).

Para validar el contrato:

```bash
npx @redocly/cli lint backend/openapi.yaml
```

## Frontend

SPA con React + TypeScript (Vite) y React Router.

- **Identidad visual**: basada en el lenguaje visual público de yol1.com, con los colores en `frontend/src/styles/tokens.css`:
  - verde bosque `#0A332B` como fondo de marca;
  - lima `#DAFF00` para la acción principal;
  - coral `#FE5933` como acento;
  - arena `#E8E3DA` para las tarjetas.
  - La tipografía corporativa (Söhne) es comercial, así que se usan equivalentes libres: Archivo expandido para los títulos, Inter para el texto y JetBrains Mono para botones y etiquetas.
- **Comunicación con el usuario**: todos los mensajes viven en `frontend/src/utils/messages.ts`, uno por código de error del contrato. Son directos, en segunda persona y siempre dicen qué hacer a continuación.
- **Sesión**: `AuthProvider` guarda el token en `sessionStorage`, de modo que sobrevive a un refresh y se borra al cerrar la pestaña. La sesión se cierra en tres casos:
  - cuando vence el token;
  - cuando cualquier llamada responde `401` (`MISSING_TOKEN`, `INVALID_TOKEN` o `TOKEN_EXPIRED`), y la pantalla de login muestra el motivo;
  - cuando el usuario cierra sesión.
- **Rutas**: `/login` es solo para quien no tiene sesión y `/score` solo para quien la tiene.

> Trade-off: una cookie `httpOnly` protegería mejor el token frente a XSS, pero requiere cambiar el contrato del API. Queda como mejora.

## Uso de IA

Ver [ai_interactions.md](ai_interactions.md).
