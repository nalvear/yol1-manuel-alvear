# Consulta de Riesgo Financiero — MVP

API REST segura (Node.js + TypeScript + JWT) y SPA (React + TypeScript) para consultar el *score* crediticio de personas o empresas por RUT, con control de acceso por roles (`admin` / `user`).

## Inicio rápido

Requisitos: Node.js >= 20 (ver `.nvmrc`) y npm >= 10.

```bash
npm install
npm run dev
```

| Servicio | URL                   |
|----------|-----------------------|
| Web      | http://localhost:5173 |
| API      | http://localhost:3000 |

No hace falta crear archivos `.env` para probar en local, porque todas las variables tienen un valor por defecto de desarrollo. Para personalizarlas:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Variable         | Dónde    | Por defecto             | Descripción                                                                 |
|------------------|----------|-------------------------|-----------------------------------------------------------------------------|
| `PORT`           | backend  | `3000`                  | Puerto de la API.                                                           |
| `JWT_SECRET`     | backend  | secreto solo para desarrollo | Secreto de firma del JWT. **Obligatorio con `NODE_ENV=production`**.   |
| `JWT_EXPIRES_IN` | backend  | `3600`                  | Segundos de validez del token.                                              |
| `CORS_ORIGIN`    | backend  | `http://localhost:5173` | Origen permitido para el frontend.                                          |
| `VITE_API_URL`   | frontend | `http://localhost:3000` | URL base de la API.                                                         |

## Usuarios de prueba (mock)

| Usuario    | Contraseña   | Rol     | Puede consultar        |
|------------|--------------|---------|------------------------|
| `admin`    | `admin123`   | `admin` | Cualquier RUT          |
| `usuario`  | `usuario123` | `user`  | Solo `12.345.678-5`    |
| `usuario2` | `usuario123` | `user`  | Solo `11.111.111-1`    |

En la pantalla de login, el panel **"Usuarios de prueba"** completa el formulario con un clic. Las contraseñas se guardan como hash scrypt en `backend/src/data/users.mock.ts`.

Otros RUT válidos para probar con `admin`: `9.876.543-3`, `10.000.013-K` y `22.222.222-2`.

> ⚠️ El RUT de ejemplo del enunciado (`12.345.678-9`) tiene un **dígito verificador inválido**. La API responde `400 INVALID_RUT` y el frontend lo marca antes de enviar. El RUT válido equivalente es `12.345.678-5`.

## Scripts

Desde la raíz del repositorio:

| Comando             | Qué hace                                                    |
|---------------------|-------------------------------------------------------------|
| `npm run dev`       | Levanta la API y la web en paralelo, con recarga en caliente. |
| `npm test`          | Corre los tests del backend (Vitest + Supertest) y del frontend (Vitest). |
| `npm run typecheck` | Revisa los tipos de ambos paquetes.                         |
| `npm run build`     | Compila el backend (`backend/dist`) y el frontend (`frontend/dist`). |

## API

El contrato completo está en OpenAPI 3.1: [`backend/openapi.yaml`](backend/openapi.yaml). Para validarlo: `npx @redocly/cli lint backend/openapi.yaml`.

| Método | Ruta           | Auth   | Respuestas         |
|--------|----------------|--------|--------------------|
| POST   | `/login`       | —      | 200, 400, 401      |
| GET    | `/score/{rut}` | Bearer | 200, 400, 401, 403 |
| GET    | `/health`      | —      | 200                |

### Ejemplo

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"usuario","password":"usuario123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl http://localhost:3000/score/12.345.678-5 -H "Authorization: Bearer $TOKEN"
# {"rut":"12.345.678-5","score":12,"fecha":"2026-10-21T17:18:11.506Z"}

curl http://localhost:3000/score/11.111.111-1 -H "Authorization: Bearer $TOKEN"
# {"error":{"code":"FORBIDDEN_RUT","message":"No tienes permiso para consultar este RUT."}}
```

### JWT

El token se firma con HS256 y su *payload* contiene:

- `sub`: ID del usuario.
- `role`: `admin` o `user`.
- `rut`: RUT normalizado del usuario. **Solo se incluye para el rol `user`.**
- `iat` y `exp`.

### Autorización

| Rol     | `GET /score/{rut}`                                         |
|---------|------------------------------------------------------------|
| `admin` | Cualquier RUT válido.                                      |
| `user`  | Solo el RUT de su token. Cualquier otro → `403 FORBIDDEN_RUT`. |

Los RUT se comparan **normalizados**, así que `12.345.678-5`, `12345678-5` y `123456785` son el mismo RUT.

Los middlewares se evalúan en este orden:

1. `authenticate` → `401`
2. `validateRutParam` → `400`
3. `authorizeRut` → `403`

### Errores

Todas las respuestas de error tienen la forma `{ "error": { "code", "message", "details?" } }`. El `code` es estable y el frontend lo usa para decidir qué mensaje mostrar.

| HTTP | `code`                | Cuándo                                                    |
|------|-----------------------|-----------------------------------------------------------|
| 400  | `VALIDATION_ERROR`    | Body de `/login` inválido o JSON mal formado (con detalle por campo). |
| 400  | `INVALID_RUT`         | Formato o dígito verificador inválido.                    |
| 401  | `INVALID_CREDENTIALS` | Usuario o contraseña incorrectos (mensaje genérico).      |
| 401  | `MISSING_TOKEN`       | Sin header `Authorization: Bearer`.                       |
| 401  | `INVALID_TOKEN`       | Firma, algoritmo o *claims* inválidos.                    |
| 401  | `TOKEN_EXPIRED`       | Token vencido.                                            |
| 403  | `FORBIDDEN_RUT`       | Rol `user` consultando un RUT ajeno.                      |
| 404  | `NOT_FOUND`           | Ruta inexistente.                                         |
| 500  | `INTERNAL_ERROR`      | Error inesperado (sin exponer detalles internos).         |

### Score determinista

`score = SHA-256(RUT normalizado)`. Se toman los primeros 4 bytes como entero y se aplica `mod 101`, lo que da un valor entre 0 y 100:

- El mismo RUT siempre produce el mismo score, sin importar cómo esté escrito.
- RUTs distintos se reparten de forma uniforme en el rango.
- Con 101 valores posibles, dos RUTs pueden coincidir en el score.

## Frontend

React 19 + TypeScript + Vite, con React Router y CSS Modules. No usa librerías de UI.

**Identidad visual**

Está basada en el lenguaje visual público de yol1.com, con los tokens en [`frontend/src/styles/tokens.css`](frontend/src/styles/tokens.css):

- Colores:
  - verde bosque `#0A332B`, el fondo de marca;
  - lima `#DAFF00`, la acción principal;
  - coral `#FE5933`, el acento;
  - arena `#E8E3DA`, las tarjetas.
- Tipografía: Söhne es una fuente comercial, así que se usan equivalentes libres: Archivo expandido, Inter y JetBrains Mono.
- No usa el logo de YOL1, solo su estilo.

**Comunicación**

Los mensajes están en [`utils/messages.ts`](frontend/src/utils/messages.ts), uno por cada código de error del contrato. Son directos, en segunda persona y siempre dicen qué hacer a continuación.

**Sesión**

El token se guarda en `sessionStorage`: sobrevive a un refresh y se borra al cerrar la pestaña. La sesión se cierra en estos casos:

- Cuando vence el token. Dos minutos antes se muestra un aviso.
- Ante cualquier `401` de token. La pantalla de login muestra el motivo.
- Cuando el usuario cierra sesión.

### Controles de usabilidad para evitar errores

**Login**
- Valida en el cliente antes de llamar a la API y lleva el foco al primer campo con error.
- Los errores aparecen al enviar, o al salir de un campo que ya se editó, nunca mientras se escribe.
- El error reemplaza al texto de ayuda en el mismo espacio. Así un salto del layout no hace que el clic caiga fuera del botón.
- Los campos se deshabilitan durante el envío y se bloquea el doble envío.
- Hay un botón para mostrar u ocultar la contraseña y un aviso cuando Bloq Mayús está activado.
- Usa `autocomplete` y los largos máximos del contrato.
- Si las credenciales fallan, se limpia la contraseña y el foco vuelve a ese campo.

**Consulta de score**
- El RUT se formatea mientras se escribe (`12.345.678-5`). Solo acepta dígitos y una K final.
- El dígito verificador se valida en el cliente, lo que evita los `400` que se pueden prevenir.
- **Chequeo anticipado de permisos**: si un `user` escribe un RUT ajeno, se le avisa y no se envía la consulta. Se le ofrece el atajo "Usar mi RUT". El `403` del backend se sigue manejando por si llega.
- Para el rol `user`, el campo parte con su propio RUT.
- Se ignoran las respuestas de consultas anteriores que lleguen tarde.
- Al terminar, el foco pasa al resultado y el medidor del score usa `role="meter"`.
- Un historial de la sesión guarda las últimas 5 consultas.
- Un `ErrorBoundary` evita que un error de render deje la pantalla en blanco.
- Tramos del score (supuesto: a mayor score, menor riesgo): 0–39 riesgo alto, 40–69 medio, 70–100 bajo.

## Estructura

```
backend/
  openapi.yaml          Contrato de la API
  src/
    config/             Variables de entorno validadas
    data/               Usuarios mock
    errors/             AppError con los códigos del contrato
    middlewares/        authenticate, validateRutParam, authorizeRut, errores, 404
    routes/             /login y /score/:rut
    services/           Auth (firma JWT) y score
    utils/              RUT (módulo 11) y contraseñas (scrypt)
    validators/         Validación del body de /login
  tests/                Unitarios e integración (Vitest + Supertest)
frontend/
  src/
    api/                Cliente HTTP tipado según el contrato
    components/         UI base, layouts, login y score
    context/            AuthProvider (sesión)
    hooks/              useFocusWhenIdle, useDocumentTitle
    pages/              LoginPage, ScorePage
    routes/             Rutas protegidas
    styles/             Design tokens y estilos globales
    utils/              RUT, score y mensajes al usuario
```

## Decisiones técnicas

- **Contrato primero**: el OpenAPI se escribió antes que el código, y los códigos de error y el patrón de RUT se comparten entre backend y frontend.
- **Sin dependencias para la seguridad básica**: el hash de contraseñas usa `scrypt` y `timingSafeEqual`, ambos nativos de Node.
- **Login sin enumeración de usuarios**: el mensaje `401` es el mismo si el usuario no existe o si la contraseña está mal. Además, cuando el usuario no existe se verifica contra un hash ficticio, para que el tiempo de respuesta tampoco lo delate.
- **JWT estricto**: el algoritmo está fijado en HS256, lo que rechaza tokens `alg: none` y otros algoritmos. También se validan los *claims*: un `user` sin RUT válido, un `admin` con RUT o un rol desconocido dan `401`.
- **Express 5**: los errores de los handlers `async` llegan solos al middleware de errores.

## Mejoras con más tiempo

- Token en una cookie `httpOnly` con refresh token, en lugar de `sessionStorage`.
- Rate limiting en `/login` y headers de seguridad (`helmet`).
- Logs estructurados con request id y auditoría persistente de consultas.
- Tests de componentes (Testing Library) y e2e (Playwright) para el frontend.
- Generar los tipos del frontend desde `openapi.yaml`.

## Uso de IA

Ver [`ai_interactions.md`](ai_interactions.md).
