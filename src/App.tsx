import { Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import "./App.css";
import Login from "./pages/Login";
import InicioPage from "./pages/InicioPage";
import Map from "./pages/Map";
import Clientes from "./pages/Clientes";
import Comerciales from "./pages/Comerciales";
import Visitas from "./pages/Visitas";
import NotFoundBSOD from "./pages/NotFoundBSOD";
import { GuestRoute, ProtectedRoute } from "./guards/ProtectedRoute";
import { IsAdmin } from "./guards/RolRoutes";

function App() {
  return (
    <Routes>
      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/Login" />} />

      {/* Rutas públicas */}
      <Route element={<GuestRoute />}>
        <Route path="/Login" element={<Login />} />
      </Route>

      {/* Rutas privadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/Inicio" element={<InicioPage />} />
        <Route path="/Map" element={<Map />} />
        <Route path="/Visitas" element={<Visitas />} />
        <Route path="/Clientes" element={<Clientes />} />
        
        {/* Rutas por rol */}
        <Route element={<IsAdmin />}>
          <Route path="/Comerciales" element={<Comerciales />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundBSOD />} />
    </Routes>
  );
}

export default App;
