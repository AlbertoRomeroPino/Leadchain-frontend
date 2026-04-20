<h1 align="center">
  <a href="#">Leadchain Frontend</a>
</h1>

<h3 align="center">Frontend React para la gestión de clientes, edificios, visitas y zonas geolocalizadas.</h3>

<p align="center">
  <a href="https://github.com/AlbertoRomeroPino/Leadchain-frontend">
    <img alt="Frontend Repo" src="https://img.shields.io/badge/Frontend-Repo-blue?style=for-the-badge&logo=github&logoColor=white">
  </a>
  <a href="https://github.com/AlbertoRomeroPino/Leadchain-backend">
    <img alt="Backend API Repo" src="https://img.shields.io/badge/Backend-API%20Repo-black?style=for-the-badge&logo=github&logoColor=white">
  </a>
</p>

<p align="center" style="color: #666; margin-top: 6px;">
  Proyecto en construcción: algunas funcionalidades aún pueden estar en mejora.
</p>

<p align="center">
  <a href="#acerca">Acerca</a> •
  <a href="#caracteristicas">Características</a> •
  <a href="#como-funciona">Cómo funciona</a> •
  <a href="#tecnologias">Tecnologías</a> •
  <a href="#estructura-del-proyecto">Estructura</a> •
  <a href="#scripts">Scripts</a> •
  <a href="#autor">Autor</a> •
  <a href="#licencia">Licencia</a>
</p>

## Acerca

Leadchain Frontend es la aplicación cliente de un proyecto TFG para la gestión de rutas comerciales y visitas técnicas. Incluye autenticación por token, roles de usuario, mapas interactivos y paneles de control para clientes, edificios, zonas y comerciales.

- Backend API: https://github.com/AlbertoRomeroPino/Leadchain-backend.git
- Frontend: https://github.com/AlbertoRomeroPino/Leadchain-frontend.git

---

## Características

- [X] Login con token JWT y almacenamiento de sesión
- [X] Renovación automática de token cuando expira
- [X] Gestión de clientes con detalle y edición
- [X] Gestión de edificios con ubicación geográfica
- [X] Gestión de zonas con polígonos sobre el mapa
- [X] Visualización de visitas y asignación por comercial
- [X] Control de acceso según roles (`admin` / `comercial`)
- [X] Mapa delimitado a Córdoba con restricciones de área
- [X] API Axios con interceptores para refresh y manejo de errores

---

## Cómo funciona

El proyecto está dividido en dos partes:

1. Backend (API con Laravel)
2. Frontend (esta aplicación React)

Este repositorio contiene solo el frontend. El backend debe ejecutarse para que la app funcione correctamente.

### Requisitos previos

Antes de empezar necesitas tener instalado:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Ejecutar la aplicación web (Frontend)

```bash
# Clona este repositorio
git clone https://github.com/AlbertoRomeroPino/Leadchain-frontend.git

# Accede a la carpeta del proyecto
cd leadchain-frontend

# Instala las dependencias
npm install

# Inicia la aplicación en modo desarrollo
npm run dev
```

Abre el navegador en `http://localhost:5173`.

---

## Tecnologías

#### Plataforma

- **React** + **TypeScript**
- **Vite**

#### Librerías principales

- **React Router Dom**
- **Axios**
- **Leaflet**
- **React Leaflet**
- **Lucide React**
- **ESLint**

---

## Estructura del proyecto

```text
Leadchain-frontend/
├── public/
│   └── icons/
│       ├── leadchain-logo.png
│       └── Logo.svg
├── scripts/
│   └── tree-front.js
├── src/
│   ├── auth/
│   ├── components/
│   ├── examples/
│   ├── guards/
│   ├── hooks/
│   ├── layout/
│   ├── main.tsx
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── types/
│   └── utils/
├── package.json
└── README.md
```

### Descripción breve

- `src/auth/` — gestión de sesión y contexto de usuario.
- `src/components/` — componentes reutilizables de la UI.
- `src/pages/` — vistas principales de la aplicación.
- `src/services/` — llamadas a la API e interceptores HTTP.
- `src/utils/` — utilidades generales.
- `scripts/tree-front.js` — comando para mostrar la estructura del frontend.

---

## Scripts

- `npm run dev` — inicia la app en modo desarrollo
- `npm run build` — construye la aplicación
- `npm run lint` — ejecuta ESLint
- `npm run preview` — previsualiza el build
- `npm run tree` — muestra la estructura de carpetas del frontend

### `npm run tree`

Este comando imprime un árbol de directorios del frontend con exclusiones configurables.

```bash
npm run tree
```

Para excluir solo los iconos de `public/icons`:

```bash
npm run tree -- --exclude-icons
```

Para excluir elementos adicionales:

```bash
npm run tree -- --exclude=public/icons,archivo-extra
```

---

## Autenticación

El frontend incluye un sistema de sesión que renueva el token JWT automáticamente cuando la API devuelve `401`.

### Qué hace

- Guarda el token y el usuario en `localStorage`.
- Detecta tokens próximos a expirar.
- Renueva el token automáticamente con `/api/auth/refresh`.
- Actualiza el contexto de React.
- Mantiene la sesión transparente al usuario.

### Archivos clave

- `src/services/https.ts`
- `src/auth/authProvider.tsx`
- `src/auth/authStorage.ts`
- `src/services/tokenManager.ts`

---

## Autor

- **Alberto Romero Pino**
- **Email**: albertoromeropino2004@gmail.com
- **LinkedIn**: [linkedin.com/in/alberto-romero-pino-8aa0a32ba](linkedin.com/in/alberto-romero-pino-8aa0a32ba)

---

## Licencia

Este proyecto está bajo la licencia **MIT**.

---

## Más información

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Leaflet](https://leafletjs.com/)
- [React Leaflet](https://react-leaflet.js.org/)
