import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authContext";

// Protege rutas que requieren autenticación
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  return <Outlet />;
}

// Redirige a la pantalla de inicio si ya está autenticado
export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/Inicio" replace />;
  }

  return <Outlet />;
}