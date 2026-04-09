import { useState, useEffect } from "react";
import { useAuth } from "../../../auth/useAuth";
import ComercialCard from "./ComercialCard";
import { UserService } from "../../../services/User";
import type { User } from "../../../types/users/User";

const InicioAdmin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [comerciales, setComerciales] = useState<User[]>([]);

  useEffect(() => {
    const cargarComerciales = async () => {
      if (!user || user.rol !== "admin") {
        setLoading(false);
        return;
      }

      try {
        const usuarios = await UserService.getUsers();
        const comercialesData = usuarios.filter(
          (usuario: User) =>
            usuario.rol === "comercial" && usuario.id_responsable === user.id,
        );
        setComerciales(comercialesData);
      } catch (err) {
        console.error("Error al cargar comerciales:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarComerciales();
  }, [user]);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="inicio-admin">
      <div className="admin-header">
        <h2 className="admin-title">Panel de Comerciales</h2>
        <p className="admin-subtitle">
          Visualiza el progreso de tus comerciales y estadísticas de visitas
        </p>
      </div>

      {/* Placeholder para cards de comerciales */}
      <ComercialCard comerciales={comerciales} />
    </div>
  );
};

export default InicioAdmin;
