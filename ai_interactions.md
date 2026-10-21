# Uso de herramientas de IA

Registro de las herramientas de IA utilizadas durante el desarrollo y qué partes apoyaron.

## Herramientas

- **Claude Code (Claude Opus)**: asistente en terminal.

## Interacciones

| # | Fase | Qué se pidió | Resultado / qué se ajustó manualmente |
|---|------|--------------|----------------------------------------|
| 1 | Planificación | Analizar el enunciado y armar una lista de tareas ordenada | Plan por fases con commits intermedios |
| 2 | Setup | Scaffolding del monorepo (workspaces, backend Express + TS, frontend Vite + React + TS) | Estructura base, tsconfig, `.env.example` |
| 3 | Diseño API | Contrato OpenAPI de `POST /login` y `GET /score/{rut}` con códigos 400/401/403 y reglas de autorización | `backend/openapi.yaml`, validado con Redocly. Se corrigió un ejemplo YAML mal formado detectado por el linter. Se usa `12.345.678-5` en los ejemplos porque el `12.345.678-9` del enunciado tiene dígito verificador inválido |
| 4 | Backend base | `AppError` con los códigos del contrato, middleware global de errores y handler 404 | `src/errors/app-error.ts`, `src/middlewares/`. JSON mal formado → 400, errores inesperados → 500 sin filtrar detalles. Tests con Supertest |
