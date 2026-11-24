# 🏛️ SAT_Lima_Final

Migración del proyecto **PaginaSAT_Lima_v04** (HTML + JS con conexión directa a la BD desde el navegador) a una arquitectura **React + Node.js/Express** dividida en dos partes:

```
SAT_Lima_Final/
├── backend/     → API REST en Node.js/Express (se despliega en Render)
├── frontend/    → SPA en React + Vite (se despliega en Vercel)
└── README.md    → Este archivo
```

Se mantiene la **misma base de datos Neon** (mismas tablas, mismos datos) y la **misma interfaz visual**. Solo se corrigieron los errores de configuración encontrados (ver sección *Errores corregidos*).

---

## 📋 Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Levantamiento en local](#levantamiento-en-local)
3. [Usuarios de prueba](#usuarios-de-prueba)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Endpoints del backend (para Postman)](#endpoints-del-backend)
6. [Pruebas automatizadas tipo Postman](#pruebas-automatizadas)
7. [Despliegue en Render (backend)](#despliegue-en-render)
8. [Despliegue en Vercel (frontend)](#despliegue-en-vercel)
9. [Errores corregidos respecto al original](#errores-corregidos)
10. [Esquema de la base de datos](#esquema-de-la-base-de-datos)

---

## Requisitos previos

- **Node.js** ≥ 18 (probado con Node 20/22/24)
- **npm** ≥ 9
- Acceso a la base de datos Neon (la URL ya viene configurada por defecto)

---

## Levantamiento en local

### 1) Backend

```bash
cd SAT_Lima_Final/backend

# Instalar dependencias
npm install

# (Opcional) Copiar el .env de ejemplo. Ya viene con valores por defecto
# que apuntan a la BD Neon compartida, así que puedes omitir este paso.
cp .env.example .env

# Arrancar en modo desarrollo (con auto-reload)
npm run dev

# O arrancar en modo producción
npm start
```

El backend queda en **http://localhost:3001**.

Verificación rápida:

```bash
curl http://localhost:3001/api/health
# {"ok":true,"servicio":"SAT Lima Backend",...}
```

### 2) Frontend

En **otra terminal**:

```bash
cd SAT_Lima_Final/frontend

# Instalar dependencias
npm install

# (Opcional) El archivo .env ya apunta a localhost:3001.
# Para producción, cámbialo por la URL de Render.

# Arrancar en modo desarrollo (hot-reload)
npm run dev
```

El frontend queda en **http://localhost:5173**.

Abrir http://localhost:5173 en el navegador. La aplicación ya debe poder consultar la BD a través del backend.

> **Para probar el build de producción localmente:**
> ```bash
> npm run build
> npm run preview
> ```

---

## Usuarios de prueba

La base de datos ya contiene estos usuarios (las contraseñas las define la BD; las conocidas para pruebas se listan abajo, si no coinciden regístrate desde `/login`):

| Rol       | Correo                    | Contraseña sugerida |
|-----------|---------------------------|---------------------|
| admin     | admin@sat.gob.pe          | *(definida en BD)*  |
| empleado  | empleado.manana@sat.gob.pe| *(definida en BD)*  |
| empleado  | empleado.noche@sat.gob.pe | *(definida en BD)*  |
| empleado  | empleado.madrugada@sat.gob.pe | *(definida en BD)* |
| cajero    | cajero01@sat.gob.pe       | *(definida en BD)*  |
| cliente   | *(regístrate desde /login → "Crear Cuenta")* | — |

> Si desconoces alguna contraseña, entra a la pestaña **Crear Cuenta** del login y registra un usuario nuevo con el rol que necesites (cliente / empleado / admin). El select de rol ahora **sí** está dentro del formulario (en el original estaba fuera y no se enviaba).

---

## Estructura del proyecto

```
SAT_Lima_Final/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── render.yaml                  ← config de despliegue Render
│   └── src/
│       ├── server.js                ← entrypoint Express
│       ├── config/db.js             ← conexión Neon (usa host pooler)
│       ├── routes/                   ← definición de rutas
│       │   ├── auth.routes.js
│       │   ├── reclamo.routes.js
│       │   ├── pago.routes.js
│       │   ├── panel.routes.js
│       │   ├── cajero.routes.js
│       │   └── tarifario.routes.js
│       ├── controllers/             ← lógica de cada endpoint
│       │   ├── auth.controller.js
│       │   ├── reclamo.controller.js
│       │   ├── pago.controller.js
│       │   ├── panel.controller.js
│       │   ├── cajero.controller.js
│       │   └── tarifario.controller.js
│       ├── middleware/errorMiddleware.js  ← manejo de errores + sesión
│       └── scripts/test_endpoints.mjs     ← suite de pruebas
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json                  ← config de despliegue Vercel
│   ├── .env.example
│   ├── index.html
│   ├── public/img/                  ← imágenes heredadas del original
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  ← router + layout
│       ├── css/index.css            ← estilos migrados (idénticos al original)
│       ├── context/AuthContext.jsx ← sesión en sessionStorage
│       ├── utils/api.js             ← cliente HTTP hacia el backend
│       ├── components/ProtectedRoute.jsx
│       └── pages/
│           ├── Inicio.jsx
│           ├── Login.jsx
│           ├── ImpuestoPredial.jsx
│           ├── ImpuestoVehicular.jsx
│           ├── Papeletas.jsx
│           ├── Panel.jsx            ← admin / empleado
│           ├── PanelCajero.jsx      ← cajero
│           └── Pasarela.jsx         ← pagos
```

---

## Endpoints del backend

Base URL local: `http://localhost:3001` · Producción (Render): `https://<tu-servicio>.onrender.com`

Todas las rutas bajo `/api`. Las que requieren sesión deben enviar el header `x-user-id: <idUsuario>` (el frontend lo hace automáticamente tras el login).

### Autenticación

| Método | Ruta               | Body / Query                          | Descripción                          |
|--------|--------------------|----------------------------------------|--------------------------------------|
| POST   | `/api/auth/registro` | `{ nombre, correo, contrasena, rol }` | Registra usuario. rol ∈ {cliente, empleado, admin, cajero} |
| POST   | `/api/auth/login`    | `{ correo, contrasena }`              | Inicia sesión, devuelve `usuario`   |
| GET    | `/api/auth/perfil`   | — (header `x-user-id`)                | Devuelve el usuario en sesión        |

### Reclamos tributarios

| Método | Ruta                          | Body / Query                          | Sesión | Descripción |
|--------|-------------------------------|----------------------------------------|--------|-------------|
| POST   | `/api/reclamos`              | `{ nombre_propietario, dni, tipo_impuesto, motivo, valor_tasacion, monto_calculado }` | sí | Registra reclamo |
| GET    | `/api/reclamos/mios`        | —                                      | sí     | Lista reclamos del usuario |
| GET    | `/api/reclamos/mios/buscar?dni=&tipo=` | query                     | sí     | Busca reclamos propios por DNI/tipo |
| GET    | `/api/reclamos/consulta?dni=&tipo=` | query                        | no     | Consulta pública por DNI |
| GET    | `/api/reclamos/:id`          | —                                      | no     | Detalle de un reclamo |
| PUT    | `/api/reclamos/:id`          | `{ motivo, tipo_impuesto? }`           | sí     | Edita reclamo propio (solo si estado=registrado) |

### Pagos

| Método | Ruta                  | Body                                    | Sesión | Rol         |
|--------|-----------------------|------------------------------------------|--------|-------------|
| POST   | `/api/pagos/tarjeta`  | `{ reclamo_id, marca, numero, titular, dni, tipo, mes, anio, cuotas? }` | sí | cualquiera logueado |
| POST   | `/api/pagos/billetera` | `{ reclamo_id, tipo, celular }`        | sí     | cualquiera logueado |
| POST   | `/api/pagos/caja`     | `{ reclamo_id, monto }`                 | sí     | cajero/admin |
| GET    | `/api/pagos`          | —                                        | sí     | cajero/admin |

### Panel (admin / empleado)

| Método | Ruta                          | Body                       | Rol             |
|--------|-------------------------------|----------------------------|-----------------|
| GET    | `/api/panel/reclamos`         | —                          | admin / empleado |
| PUT    | `/api/panel/reclamos/:id`     | `{ estado, motivo }`       | admin / empleado |
| DELETE | `/api/panel/reclamos/:id`     | —                          | admin / empleado |

> `estado` ∈ {`registrado`, `atendido`, `rechazado`}. El empleado solo ve reclamos de su turno (madrugada/manana/noche) según `EXTRACT(HOUR FROM fecha_registro)`.

### Cajero

| Método | Ruta                       | Query | Rol            |
|--------|----------------------------|-------|----------------|
| GET    | `/api/cajero/reclamos?q=`  | q     | cajero / admin |

### Tarifario

| Método | Ruta                                  | Query              |
|--------|---------------------------------------|--------------------|
| GET    | `/api/tarifario/calcular?valor_tasacion=` | valor numérico |

### Healthcheck

| Método | Ruta          |
|--------|---------------|
| GET    | `/api/health` |

---

## Pruebas automatizadas

El backend incluye una suite de pruebas estilo Postman que cubre **todos** los endpoints:

```bash
cd SAT_Lima_Final/backend
npm start              # arrancar el backend en otra terminal o en background
npm run test:postman   # ejecutar la suite
```

Resultado esperado (20 pruebas):

```
🧪 Probando API en http://localhost:3001
1) Healthcheck ✅✅
2) Login admin ✅
3) Registro + login cliente ✅✅
4) Tarifario ✅✅
5) Crear reclamo ✅
6) Consulta pública ✅✅
7) Mis reclamos ✅✅
8) Editar reclamo propio ✅
9) Pagar con billetera ✅✅
10) Panel admin ✅✅
11) Cajero ✅✅
12) 404 ✅

📊 Resultado: 20 OK, 0 FALLIDOS
```

---

## Despliegue en Render

### Opción A — Blueprint (recomendado)

1. Sube el repositorio a GitHub (carpeta `SAT_Lima_Final/` como raíz o subcarpeta).
2. En Render → **New +** → **Blueprint** → selecciona tu repo.
3. Render detecta `render.yaml` y crea el servicio `sat-lima-backend` automáticamente.
4. En **Environment**, define:
   - `DATABASE_URL` → `postgresql://neondb_owner:npg_RrXCLte0VA4Q@ep-red-tooth-b576izzc-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `CORS_ORIGIN` → la URL de tu frontend en Vercel (ej: `https://sat-lima-final.vercel.app`)
5. Render instala con `npm install` y arranca con `npm start`. El healthcheck está en `/api/health`.

### Opción B — Manual

1. Render → **New +** → **Web Service** → conecta tu repo.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Health Check Path**: `/api/health`
6. Variables de entorno: `DATABASE_URL`, `CORS_ORIGIN`, `NODE_ENV=production`.

> ⚠️ **Importante**: usa siempre la URL con `-pooler` en el host. La del proyecto original no lo tenía y causaba errores de conexión.

---

## Despliegue en Vercel

1. Vercel → **Add New Project** → importa el repo de GitHub.
2. **Root Directory**: `frontend`
3. **Framework Preset**: Vite (se detecta solo)
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_URL` → URL de tu backend en Render (ej: `https://sat-lima-backend.onrender.com`)
7. Deploy. Vercel servirá la SPA con rewrites a `index.html` (configurado en `vercel.json`).

---

## Errores corregidos

El proyecto original (`PaginaSAT_Lima_v04`) tenía estos bugs que **ya están corregidos** en `SAT_Lima_Final`:

1. **Credenciales de BD expuestas en el navegador.** El original se conectaba a Neon directamente desde JS en el frontend (`neon-config.js`), exponiendo la cadena de conexión. → Ahora toda la BD se accede desde el backend; el frontend solo habla con la API.

2. **URL de conexión sin pooler.** El original usaba `ep-red-tooth-b576izzc.c-7...` (sin `-pooler`), que en entornos serverless da el error *"this function can now be called only as a tagged-template function"*. → Se usa el host `-pooler` correcto.

3. **Select de rol fuera del formulario de registro.** En `login.html`, el `<select id="reg-rol">` estaba **fuera** del `<form id="form-register">`, así que el rol nunca se enviaba y siempre se registraba como `empleado`. → El select ahora está dentro del formulario.

4. **CSS inexistente en `pasarela.html`.** Enlazaba `css/ReclamosTributarios.css`, que no existe en el proyecto. → Se eliminó la referencia; los estilos de la pasarela están en el CSS global.

5. **Inconsistencia en los tipos de impuesto.** El select de *registro* usaba `Predial/Vehicular/Papeleta`, pero el de *consulta* usaba `Impuesto Predial/Impuesto Vehicular/Papeleta`. Un reclamo registrado como "Predial" nunca aparecía al filtrar por "Impuesto Predial". → El backend normaliza ambos a los valores canónicos de la BD (`Impuesto Predial`, `Impuesto Vehicular`, `Papeleta`).

6. **Constraint UNIQUE de billeteras mal asumida.** El original buscaba por `numero_celular AND tipo` y luego insertaba, pero la constraint UNIQUE real es sobre `numero_celular` sola. Esto causaba `duplicate key value violates unique constraint` al pagar con Yape/Plin con un celular ya registrado con otra marca. → La búsqueda ahora es solo por `numero_celular`.

7. **Orden de rutas en Express.** `/api/reclamos/mios` colisionaba con `/api/reclamos/:id` y se capturaba como `id="mios"`. → Las rutas estáticas se declaran antes que las dinámicas.

8. **`verificarSesion()` redirigía durante la carga del módulo.** En el original, llamar a `verificarSesion()` antes del `DOMContentLoaded` redirigía a `login.html` en bucle. → En React, la protección de rutas se hace con `<ProtectedRoute>` que redirige limpiamente.

---

## Esquema de la base de datos

Se conserva intacta la BD Neon existente. Tablas y columnas:

### `usuarios`
| columna           | tipo         | notas                          |
|-------------------|--------------|--------------------------------|
| id                | serial PK    |                                |
| nombre            | varchar(120) | NOT NULL                       |
| correo            | varchar(120) | NOT NULL                       |
| contrasena        | varchar(255) | NOT NULL                       |
| fecha_registro    | timestamp    | default now()                  |
| rol               | varchar(20)  | default 'empleado'             |
| turno             | varchar(20)  | null (madrugada/manana/noche)  |
| dni               | varchar(8)   | null                           |

### `reclamos_tributarios`
| columna            | tipo         | notas                                   |
|--------------------|--------------|-----------------------------------------|
| id                 | serial PK    |                                         |
| codigo_seguimiento | varchar(12)  | NOT NULL                                |
| nombre_propietario | varchar(120) |                                         |
| dni                | varchar(8)   |                                         |
| tipo_impuesto      | varchar(30)  |                                         |
| motivo             | text         |                                         |
| estado             | varchar(30)  | default 'registrado'                    |
| fecha_registro     | timestamp    | default now()                           |
| usuario_id         | integer       | FK → usuarios.id                        |
| valor_tasacion     | numeric       | default 0.00                            |
| monto_calculado    | numeric       | default 0.00                            |
| estado_pago        | varchar(20)  | default 'Pendiente'                     |
| fecha_pago         | timestamp    |                                         |
| numero_comprobante | varchar(20)  |                                         |

### `pagos`
| columna            | tipo         | notas                          |
|--------------------|--------------|--------------------------------|
| id                 | serial PK    |                                |
| reclamo_id         | integer       | FK → reclamos_tributarios.id  |
| monto              | numeric       | NOT NULL                       |
| medio_pago         | varchar(50)  | NOT NULL                       |
| numero_comprobante | varchar(20)  | NOT NULL                       |
| fecha_pago         | timestamp    | default now()                  |

### `banco_tarjetas`
| columna          | tipo         |
|------------------|--------------|
| id               | serial PK    |
| numero_tarjeta   | varchar(16)  |
| mes_expiracion   | varchar(2)   |
| anio_expiracion  | varchar(2)   |
| nombre_titular   | varchar(100) |
| tipo_tarjeta     | varchar(20)  |
| numero_cuotas    | integer (default 1) |
| dni_titular      | varchar(8)   |
| marca_tarjeta    | varchar(30)  |

### `billeteras`
| columna         | tipo         | notas                              |
|-----------------|--------------|------------------------------------|
| id              | serial PK    |                                    |
| numero_celular  | varchar(9)   | NOT NULL, **UNIQUE** (sola, no con tipo) |
| tipo            | varchar(20)  | NOT NULL (YAPE / PLIN)             |

---

## Stack tecnológico

- **Backend**: Node.js 18+, Express 4, @neondatabase/serverless, cors, morgan, dotenv
- **Frontend**: React 18, React Router 6, Vite 5
- **Base de datos**: PostgreSQL en Neon (sin cambios)
- **Despliegue**: Render (backend) + Vercel (frontend)

---

## Licencia

Proyecto académico — Servicio de Administración Tributaria de Lima (SAT Perú).
