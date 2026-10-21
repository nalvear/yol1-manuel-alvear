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

## Uso de IA

Ver [ai_interactions.md](ai_interactions.md).
