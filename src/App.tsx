import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import "./index.css";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import InicioPage from "./pages/InicioPage";
import NotFoundBSODPage from "./pages/NotFoundBSODPage";
import { GuestRoute, ProtectedRoute } from "./guards/ProtectedRoute";
import { IsAdmin } from "./guards/RolRoutes";

// Lazy loading de las páginas para mejorar el rendimiento
const MapPage = lazy(() => import("./pages/MapPage"));
const ClientesPage = lazy(() => import("./pages/ClientesPage"));
const EdificiosPage = lazy(() => import("./pages/EdificiosPage"));
const ZonaPage = lazy(() => import("./pages/ZonaPage"));
const VisitasPage = lazy(() => import("./pages/VisitasPage"));
const ComercialesPage = lazy(() => import("./pages/ComercialesPage"));

const protectedRoutes = [
  { path: "/Inicio", element: <InicioPage /> },
  { path: "/Map", element: <MapPage /> },
  { path: "/Visitas", element: <VisitasPage /> },
  { path: "/Clientes", element: <ClientesPage /> },
  { path: "/Edificios", element: <EdificiosPage /> },
  { path: "/Zona", element: <ZonaPage /> },
];

function App() {
  return (
    // Usamos Suspense para manejar la carga de componentes con lazy loading
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />

        <Route element={<GuestRoute />}>
          <Route path="/Login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          {protectedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          <Route element={<IsAdmin />}>
            <Route path="/Comerciales" element={<ComercialesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundBSODPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
