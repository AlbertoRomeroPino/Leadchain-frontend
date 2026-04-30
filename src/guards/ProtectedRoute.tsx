import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// Protege rutas que requieren autenticación
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/Login" replace />;
};

// Redirige a inicio si ya está autenticado
export const GuestRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/Inicio" replace /> : <Outlet />;
};