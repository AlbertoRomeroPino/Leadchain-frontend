import { useAuth } from "../auth/authContext";
import { Navigate, Outlet } from "react-router-dom";

export const IsAdmin = () => {
  const { user } = useAuth();

  if (!user || user.rol !== "admin") {
    return <Navigate to="/Inicio" replace />;
  }

  return <Outlet />;
};

export const IsComercial = () => {
  const { user } = useAuth();
  
  if (!user || user.rol !== "comercial") {
    return <Navigate to="/Inicio" replace />;
  }
  
  return <Outlet />;
};
