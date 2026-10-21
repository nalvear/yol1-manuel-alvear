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

## Uso de IA

Ver [ai_interactions.md](ai_interactions.md).
