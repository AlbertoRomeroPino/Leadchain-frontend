import { Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import InicioPage from "./pages/InicioPage";
import MapPage from "./pages/MapPage";
import ClientesPage from "./pages/ClientesPage";
import ComercialesPage from "./pages/ComercialesPage";
import VisitasPage from "./pages/VisitasPage";
import EdificiosPage from "./pages/EdificiosPage";
import NotFoundBSODPage from "./pages/NotFoundBSODPage";
import { GuestRoute, ProtectedRoute } from "./guards/ProtectedRoute";
import { IsAdmin } from "./guards/RolRoutes";
import ZonaPage from "./pages/ZonaPage";

function App() {
  return (
    <Routes>
      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/Login" />} />

      {/* Rutas públicas */}
      <Route element={<GuestRoute />}>
        <Route path="/Login" element={<LoginPage />} />
      </Route>

      {/* Rutas privadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/Inicio" element={<InicioPage />} />
        <Route path="/Map" element={<MapPage />} />
        <Route path="/Visitas" element={<VisitasPage />} />
        <Route path="/Clientes" element={<ClientesPage />} />
        <Route path="/Edificios" element={<EdificiosPage />} />
        <Route path="/Zona" element={<ZonaPage />} />
        
        {/* Rutas por rol */}
        <Route element={<IsAdmin />}>
          <Route path="/Comerciales" element={<ComercialesPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundBSODPage />} />
    </Routes>
  );
}

export default App;
