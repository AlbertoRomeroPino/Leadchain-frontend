import { useState } from "react";
import "../../../styles/components/Inicio/InicioAdmin/InicioAdmin.css";
import { useAuth } from "../../../auth/useAuth";
import { useInitialize } from "../../../hooks/useInitialize";
import ComercialCard from "./ComercialCard/ComercialCard";
import { InicioService } from "../../../services/InicioService";
import { showLoadingAlert, showErrorAlert, showSuccessAlert } from "../../utils/errorHandler";
import type { User, Visita, Cliente, Edificio, Zona } from "../../../types";

interface AdminDashboardState {
  comerciales: User[];
  visitas: Visita[];
  clientes: Cliente[];
  edificios: Edificio[];
  zonas: Zona[];
}

const InicioAdmin = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardState>({
    comerciales: [],
    visitas: [],
    clientes: [],
    edificios: [],
    zonas: [],
  });

  useInitialize(async () => {
    if (!user || user.rol !== "admin") {
      return;
    }

    try {
      showLoadingAlert("Cargando tablero...");

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
        zonas: inicioData.zonas,
      });
      showSuccessAlert("Información cargada");
    } catch (error) {
      showErrorAlert(error, "Cargar Tablero");
      console.error("Error al cargar dashboard admin:", error);
    }
  }, [user?.id]);

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
        zonas={data.zonas}
      />
    </div>
  );
};

export default InicioAdmin;
