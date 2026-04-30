import type { Visita } from "../../../types";
import "../../../styles/components/Visitas/Admin/VisitasAdminGrid.css";
import VisitaCardAdmin from "./VisitaCardAdmin";
import VisitasHeaderAdmin from "./VisitasHeaderAdmin";
import { useState } from "react";
import {
  showErrorAlert,
  showLoadingAlert,
  showSuccessAlert,
} from "../../utils/errorHandler";
import { VisitasService } from "../../../services/VisitasService";
import { useInitialize } from "../../../hooks/useInitialize";
import showStatusAlert from "../../utils/StatusAlert";

const VisitasAdminGrid = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visitas, setVisitas] = useState<Visita[]>([]);

  useInitialize(async () => {
    try {
      showLoadingAlert("Cargando visitas...");

      const data = await VisitasService.getVisitasPaginaDatos();

      setVisitas(data.visitas);
    } catch (error) {
      showErrorAlert(error, "Cargar Visitas");
    }
  });

  const statusOptions = visitas
    ? Array.from(
        new Set(
          visitas
            .map((visita) => visita.estado?.etiqueta?.trim() ?? "")
            .filter(Boolean),
        ),
      )
    : [];

  const filteredVisitas =
    visitas?.filter((visita) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = [visita.usuario?.nombre, visita.usuario?.apellidos]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

      const statusName = visita.estado?.etiqueta?.toLowerCase() ?? "";
      const matchesStatus =
        statusFilter === "all" || statusName === statusFilter;

      return matchesSearch && matchesStatus;
    }) ?? [];

  const refreshVisitas = async () => {
    try {
      const data = await VisitasService.getVisitasPaginaDatos();
      setVisitas(data.visitas);
    } catch (error) {
      console.error(error);
    }
  };

  const onDelete = (visita: Visita) => {
    showStatusAlert({
      title: "Deseas eliminar esta visita?",
      description: "Esta accion no se puede deshacer.",
      type: "action",
      actionLabel: "Si, eliminar",
      onAction: async () => {
        try {
          await VisitasService.deleteVisita(visita.id);
          await refreshVisitas();
          showSuccessAlert("Visita eliminada");
        } catch (error) {
          showErrorAlert(error, "Eliminar Visita");
          console.error(error);
        }
      },
    });
  };

  const getCardStyle = (colorHex?: string) => ({
    borderColor: colorHex ?? "#3f1b1b",
    background: colorHex
      ? `linear-gradient(180deg, ${colorHex}22 0%, rgba(19, 19, 29, 0.96) 100%)`
      : "linear-gradient(180deg, rgba(12, 12, 22, 0.98) 0%, rgba(19, 19, 29, 0.96) 100%)",
    boxShadow: colorHex
      ? `0 10px 30px ${colorHex}33`
      : "0 10px 30px rgba(0,0,0,0.22)",
  });

  const getBuildingLabel = (visita: Visita) => {
    const cliente = visita.cliente;
    if (!cliente) return "Cliente eliminado";
    const edificio = cliente.edificios?.[0];
    return edificio?.direccion_completa ?? "Edificio no disponible";
  };

  return (
    <>
      <main className="visitas-page">
        <VisitasHeaderAdmin
          search={search}
          statusFilter={statusFilter}
          statusOptions={statusOptions}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
        />

        <div className="visitas-grid admin-visitas-grid">
          {filteredVisitas.map((visita) => (
            <VisitaCardAdmin
              key={visita.id}
              visita={visita}
              buildingLabel={getBuildingLabel(visita)}
              style={getCardStyle(visita.estado?.color_hex)}
              onDelete={onDelete}
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default VisitasAdminGrid;
