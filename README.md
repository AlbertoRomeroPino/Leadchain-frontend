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

<p align="center">
  <a href="#Acerca">Acerca</a> •
  <a href="#Caracteristicas">Características</a> •
  <a href="#Como-funciona">Cómo funciona</a> •
  <a href="#Tecnologias">Tecnologías</a> •
  <a href="#Estructura-del-proyecto">Estructura</a> •
  <a href="#Scripts">Scripts</a> •
  <a href="#Autor">Autor</a> •
  <a href="#Licencia">Licencia</a>
</p>

## Acerca

Leadchain Frontend es la aplicación cliente de un proyecto TFG para la gestión de rutas comerciales y visitas técnicas. Incluye autenticación por token, roles de usuario, mapas interactivos y paneles de control para clientes, edificios, zonas y comerciales.

- API Rest: [repositorio backend](https://github.com/AlbertoRomeroPino/Leadchain-backend.git)
- Frontend: [Repositorio Frontend](https://github.com/AlbertoRomeroPino/Leadchain-frontend.git)

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

> Nota: Se necesita tener lanzado el backend para que funcione el login

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
- **Sileo**

---

### Descripción breve

- `src/auth/` — gestión de sesión y contexto de usuario.
- `src/components/` — componentes reutilizables de la UI.
- `src/pages/` — vistas principales de la aplicación.
- `src/services/` — llamadas a la API e interceptores HTTP.
- `src/utils/` — utilidades generales.
- `scripts/tree-front.js` — comando para mostrar la estructura del frontend.

---

## Scripts

* `npm run dev`: Inicia el entorno de desarrollo en `http://localhost:5173`.
* `npm run build`: Genera el build para producción.
* `npm run tree`: Muestra la estructura de directorios filtrando archivos innecesarios.

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

## Estructura del proyecto

```text
Leadchain-frontend
├── dist
│   ├── assets
│   │   ├── framework-vendor-CIGW-MKW.css
│   │   ├── framework-vendor-CVc0_C0b.js
│   │   ├── index-BiRZRfpw.js
│   │   ├── index-BPNxTgO0.css
│   │   ├── network-vendor-BOeqtr82.js
│   │   ├── ui-vendor-D-5DAzdn.js
│   │   ├── vendor-C1M2qnCh.js
│   │   ├── ZonaPage-BZ-HEB4c.css
│   │   └── ZonaPage-Ds9RISy0.js
│   ├── icons
│   │   ├── leadchain-logo.png
│   │   └── Logo.svg
│   └── index.html
├── public
│   └── icons
│       ├── leadchain-logo.png
│       └── Logo.svg
├── scripts
│   └── tree-front.js
├── src
│   ├── auth
│   │   ├── AuthContext.ts
│   │   ├── authProvider.tsx
│   │   ├── authStorage.ts
│   │   └── useAuth.ts
│   ├── components
│   │   ├── Clientes
│   │   │   ├── Info
│   │   │   │   ├── InfoClienteDatosCard.tsx
│   │   │   │   ├── InfoClienteEdificioCard.tsx
│   │   │   │   ├── InfoClienteEditModal.tsx
│   │   │   │   ├── InfoClienteToolbar.tsx
│   │   │   │   └── InfoClienteVisitasCard.tsx
│   │   │   ├── ClienteForm.tsx
│   │   │   ├── ClienteInfo.tsx
│   │   │   ├── ClientesConEdificioTable.tsx
│   │   │   ├── ClientesCreateModal.tsx
│   │   │   ├── ClientesHeader.tsx
│   │   │   ├── ClientesSinEdificioTable.tsx
│   │   │   └── ClienteTabla.tsx
│   │   ├── Comerciales
│   │   │   ├── ComercialesForm.tsx
│   │   │   ├── ComercialesFormModal.tsx
│   │   │   ├── ComercialesHeader.tsx
│   │   │   ├── ComercialesRow.tsx
│   │   │   ├── ComercialesStatus.tsx
│   │   │   └── ComercialesTable.tsx
│   │   ├── Edificios
│   │   │   ├── FormularioModal
│   │   │   │   ├── EdificioModalCliente.tsx
│   │   │   │   ├── EdificioModalEdificio.tsx
│   │   │   │   ├── EdificioModalMapa.tsx
│   │   │   │   └── EdificioModalPestaña.tsx
│   │   │   ├── Info
│   │   │   │   ├── EdificioInfoClienteCard.tsx
│   │   │   │   ├── EdificioInfoClienteInfo.tsx
│   │   │   │   ├── EdificioInfoDetailsCard.tsx
│   │   │   │   ├── EdificioInfoMapCard.tsx
│   │   │   │   └── EdificioInfoToolbar.tsx
│   │   │   ├── EdificioCreateModal.tsx
│   │   │   ├── EdificioForm.tsx
│   │   │   ├── EdificioHeader.tsx
│   │   │   ├── EdificioInfo.tsx
│   │   │   └── EdificioTabla.tsx
│   │   ├── Inicio
│   │   │   ├── InicioAdmin
│   │   │   │   ├── ComercialCard
│   │   │   │   │   ├── ComercialCard.tsx
│   │   │   │   │   ├── ComercialCardIndividual.tsx
│   │   │   │   │   └── ComercialStatsBars.tsx
│   │   │   │   └── InicioAdmin.tsx
│   │   │   └── InicioComercial
│   │   │       ├── ClientesSinVisitar
│   │   │       │   ├── ClienteConVisitaCard.tsx
│   │   │       │   ├── ClienteSinVisitaCard.tsx
│   │   │       │   ├── ClientesSinVisitar.tsx
│   │   │       │   └── ClientesStats.tsx
│   │   │       └── InicioComercial.tsx
│   │   ├── MapSetup
│   │   │   ├── MAP_BOUNDS_RESTRICTIONS_GUIDE.md
│   │   │   ├── MapView.tsx
│   │   │   └── ZoomCalculator.tsx
│   │   ├── MapViews
│   │   │   ├── AdminMapView.tsx
│   │   │   ├── CommercialMapView.tsx
│   │   │   ├── EdificioMarker.tsx
│   │   │   └── MapBoundsSetup.tsx
│   │   ├── sidebar
│   │   │   └── MenuButtons.tsx
│   │   ├── utils
│   │   │   ├── cordobaMapConfig.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── GlovalMap.tsx
│   │   │   ├── MapaEdificioPanel.tsx
│   │   │   └── StatusAlert.tsx
│   │   ├── Visitas
│   │   │   ├── Admin
│   │   │   │   ├── VisitaCardAdmin.tsx
│   │   │   │   └── VisitasAdminGrid.tsx
│   │   │   ├── Comercial
│   │   │   │   ├── VisitaCardComercial.tsx
│   │   │   │   └── VisitasComercialGrid.tsx
│   │   │   ├── FormularioModal
│   │   │   │   └── VisitaFormularioModal.tsx
│   │   │   └── VisitasHeader.tsx
│   │   └── Zona
│   │       ├── FormularioModal
│   │       │   └── ZonaFormularioModal.tsx
│   │       ├── ZonaDetails.tsx
│   │       ├── ZonaHeader.tsx
│   │       ├── ZonaInfo.tsx
│   │       ├── ZonaList.tsx
│   │       └── ZonaMap.tsx
│   ├── guards
│   │   ├── ProtectedRoute.tsx
│   │   └── RolRoutes.tsx
│   ├── hooks
│   │   ├── useCalculateZoomFromBounds.ts
│   │   ├── useInitialize.ts
│   │   └── useMapBoundsRestrictions.ts
│   ├── layout
│   │   └── Sidebar.tsx
│   ├── pages
│   │   ├── ClientesPage.tsx
│   │   ├── ComercialesPage.tsx
│   │   ├── EdificiosPage.tsx
│   │   ├── InicioPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MapPage.tsx
│   │   ├── NotFoundBSODPage.tsx
│   │   ├── VisitasPage.tsx
│   │   └── ZonaPage.tsx
│   ├── services
│   │   ├── authService.ts
│   │   ├── ClientesService.ts
│   │   ├── EdificiosService.ts
│   │   ├── EstadoVisitaService.ts
│   │   ├── ExceptionService.ts
│   │   ├── https.ts
│   │   ├── InicioService.ts
│   │   ├── tokenManager.ts
│   │   ├── User.ts
│   │   ├── UserService.ts
│   │   ├── VisitasService.ts
│   │   └── ZonaService.ts
│   ├── styles
│   │    └── components
│   │       ├── Clientes
│   │       │   └── Info
│   │       ├── Comerciales
│   │       ├── Edificios
│   │       │   ├── FormularioModal
│   │       │   └── Info
│   │       ├── Inicio
│   │       │   ├── InicioAdmin
│   │       │   │   └── ComercialCard
│   │       │   └── InicioComercial
│   │       │       └── ClientesSinVisitar
│   │       ├── sidebar
│   │       ├── utils
│   │       ├── Visitas
│   │       │   ├── Admin
│   │       │   ├── Comercial
│   │       │   └── FormularioModal
│   │       └── Zona
│   │           └── FormularioModal
│   ├── types
│   │   ├── clientes
│   │   │   ├── Cliente.ts
│   │   │   └── ClienteDetalle.ts
│   │   ├── edificios
│   │   │   └── Edificio.ts
│   │   ├── shared
│   │   │   └── GeoPoint.ts
│   │   ├── users
│   │   │   └── User.ts
│   │   ├── visitas
│   │   │   ├── EstadoVisita.ts
│   │   │   └── Visita.ts
│   │   └── zonas
│   │       └── Zona.ts
│   ├── utils
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env
├── .gitignore
├── index.html
├── package.json
└── README.md
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

## Más información

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Leaflet](https://leafletjs.com/)
- [React Leaflet](https://react-leaflet.js.org/)
