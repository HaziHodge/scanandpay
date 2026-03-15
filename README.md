# Scan & Pay MVP

Un sistema SaaS de "Carta Digital + Pedidos + Pagos WebPay" para bares, restaurantes y eventos en Chile, sin necesidad de descargar aplicaciones.

## Arquitectura

El proyecto es un monorepo que contiene dos aplicaciones separadas:
1. **/frontend**: Aplicación React + Vite + Tailwind CSS para clientes y dashboard de dueños.
2. **/backend**: API Node.js + Express + PostgreSQL + Socket.IO para el manejo de lógica, base de datos y pagos.

## Requisitos Previos

- Node.js (v18 o superior recomendado)
- PostgreSQL (Base de datos local o remota)
- Cuenta sandbox en [Flow.cl](https://www.flow.cl/)

## Configuración Local

### 1. Variables de Entorno

**En el Backend (`/backend/.env`):**
Copia el archivo `.env.example` a `.env` y ajusta los valores:
```env
PORT=3000
DATABASE_URL=postgres://tu_usuario:tu_password@localhost:5432/scanpay_db
JWT_SECRET=un_secreto_super_seguro
FLOW_API_KEY=tu_api_key_de_sandbox
FLOW_SECRET_KEY=tu_secret_key_de_sandbox
FLOW_API_URL=https://sandbox.flow.cl/api
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3000
```

**En el Frontend (`/frontend/.env`):**
Copia `.env.example` a `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 2. Base de Datos

Entra a PostgreSQL y crea la base de datos:
`CREATE DATABASE scanpay_db;`

Ejecuta las migraciones en orden (puedes usar herramientas como `psql` o un gestor como Beekeeper Studio):
1. `backend/migrations/001_init.sql` (Crea la estructura de tablas)
2. `backend/migrations/002_seed.sql` (Inserta datos de prueba: local, cuentas, y platos)

### 3. Instalación de Dependencias

Desde la raíz del proyecto, ejecuta el script automatizado para instalar ambas carpetas:
```bash
npm run install:all
```

### 4. Iniciar el Proyecto

Desde la raíz del proyecto, abre dos terminales:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Credenciales de Prueba (Seed)

El script de seed inicializa una cuenta de dueño para pruebas locales:
- **Email:** admin@elliguria.cl
- **Contraseña:** password123
- **Local:** Bar El Liguria (slug: `bar-el-liguria`)

## Visualización

- **Dashboard:**  `http://localhost:5173/dashboard/login`
- **Vista Cliente (Mesa 1):** `http://localhost:5173/menu/bar-el-liguria/1`

## Pruebas de Flow.cl (Sandbox)

La integración utiliza la API de creación de pagos de Flow.cl.
Al pagar un pedido en entorno local:
1. Serás redirigido al portal falso de Sandbox de Flow.
2. Ingresa un email cualquiera y elige "WebPay".
3. Acepta el pago con la tarjeta de crédito de pruebas (o elige el escenario Exitoso).
4. Flow llamará asíncronamente a tu webhook (`/api/webhooks/flow`).
   *Nota: Para que Flow pueda alcanzar localhost, necesitas exponer el puerto 3000 con **Ngrok** (`ngrok http 3000`) y usar esa URL pública en el entorno de desarrollo como `API_URL` durante las pruebas estrictas.*

## Deployment Recomendado

1. **Base de Datos (PostgreSQL):** Supabase o Railway.
2. **Backend (Node.js):** Railway, Render o Fly.io.
   - Configurar variables de entorno (las de producción de Flow).
   - El front-end se conectará a este entorno mediante CORS.
3. **Frontend (React/Vite):** Vercel o Netlify.
   - Enlazar repo de Github y apuntar el "Root Directory" a `frontend`.
   - Modificar las variables de CLI de Vercel para que apunten al backend subido en lugar de localhost.
