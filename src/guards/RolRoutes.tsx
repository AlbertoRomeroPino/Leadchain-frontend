import { useAuth } from "../context/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import type { User } from "../types";

// Factory para crear guards de rol genéricos
const createRoleGuard = (requiredRole: User["rol"]) => {
  return function RoleGuard() {
    const { user } = useAuth();
    return user?.rol === requiredRole ? <Outlet /> : <Navigate to="/Inicio" replace />;
  };
};

export const IsAdmin = createRoleGuard("admin");
export const IsComercial = createRoleGuard("comercial");
