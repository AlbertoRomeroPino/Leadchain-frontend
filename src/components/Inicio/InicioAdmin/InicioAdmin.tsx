import { useState } from "react";
import "../../../styles/components/Inicio/InicioAdmin/InicioAdmin.css";
import { useAuth } from "../../../auth/useAuth";
import { useInitialize } from "../../../hooks/useInitialize";
import ComercialCard from "./ComercialCard/ComercialCard";
import { InicioService } from "../../../services/InicioService";
import showStatusAlert from "../../utils/StatusAlert";
import type { User } from "../../../types/users/User";
import type { Visita } from "../../../types/visitas/Visita";
import type { Cliente } from "../../../types/clientes/Cliente";
import type { Edificio } from "../../../types/edificios/Edificio";

interface AdminDashboardState {
  comerciales: User[];
  visitas: Visita[];
  clientes: Cliente[];
  edificios: Edificio[];
}

const InicioAdmin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminDashboardState>({
    comerciales: [],
    visitas: [],
    clientes: [],
    edificios: [],
  });

  useInitialize(async () => {
    if (!user || user.rol !== "admin") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      showStatusAlert({
        type: "loading",
        title: "Cargando tablero...",
        description: "Obteniendo datos de comerciales, clientes y visitas",
        duration: null,
      });

      const inicioData = await InicioService.getAdminInicio();

      // Filtrar solo comerciales que dependen de este admin
      const comercialesData = inicioData.usuarios_comerciales.filter(
        (usuario) =>
          usuario.rol === "comercial" && usuario.id_responsable === user.id,
      );

      setData({
        comerciales: comercialesData,
        visitas: inicioData.visitas,
        clientes: inicioData.clientes,
        edificios: inicioData.edificios,
      });
      showStatusAlert({
        type: "success",
        title: "Información cargada",
        duration: 2000,
      });
    } catch (error) {
      showStatusAlert({
        type: "error",
        title: "No encontrado",
        duration: 4000,
      });
      console.error("Error al cargar dashboard admin:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  if (loading) {
    return <div className="loading"></div>;
  }

  return (
    <div className="inicio-admin">
      <div className="admin-header">
        <h2 className="admin-title">Panel de Comerciales</h2>
      </div>

      {/* Pasar datos consolidados a ComercialCard */}
      <ComercialCard
        comerciales={data.comerciales}
        visitas={data.visitas}
        clientes={data.clientes}
        edificios={data.edificios}
      />
    </div>
  );
};

export default InicioAdmin;
