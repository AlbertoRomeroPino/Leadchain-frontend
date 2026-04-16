import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import Sidebar from "../layout/Sidebar";
import { VisitasService } from "../services/VisitasService";
import { useInitialize } from "../hooks/useInitialize";
import { showLoadingAlert, showErrorAlert, showSuccessAlert } from "../components/utils/errorHandler";
import type { Visita } from "../types/visitas/Visita";
import type { Cliente } from "../types/clientes/Cliente";
import type { EstadoVisita } from "../types/visitas/EstadoVisita";
import VisitaFormularioModal from "../components/Visitas/FormularioModal/VisitaFormularioModal";
import VisitasHeader from "../components/Visitas/VisitasHeader";
import VisitasAdminGrid from "../components/Visitas/Admin/VisitasAdminGrid";
import VisitasComercialGrid from "../components/Visitas/Comercial/VisitasComercialGrid";
import "../styles/Visitas.css";

const Visitas = () => {
  const { user } = useAuth();

  const [visitas, setVisitas] = useState<Visita[] | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [estados, setEstados] = useState<EstadoVisita[]>([]);
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useInitialize(async () => {
    try {
      showLoadingAlert("Cargando visitas...");

      // Una sola petición consolida visitas, clientes y estados
      const data = await VisitasService.getVisitasPaginaDatos();

      setVisitas(data.visitas);
      setClientes(data.clientes);
      setEstados(data.estados);

      showSuccessAlert("Información cargada");
    } catch (error) {
      showErrorAlert(error, "Cargar Visitas");
      console.error(error);
    }
  });

  const availableClients = clientes;

  const openEditModal = (visita: Visita) => {
    setSelectedVisita(visita);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVisita(null);
    setIsModalOpen(false);
  };

  const refreshVisitas = async () => {
    try {
      const data = await VisitasService.getVisitasPaginaDatos();
      setVisitas(data.visitas);
      setClientes(data.clientes);
      setEstados(data.estados);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveVisita = async (payload: {
    id_cliente: number;
    fecha_hora: string;
    id_estado: number;
    observaciones: string;
  }) => {
    try {
      if (selectedVisita) {
        const idUsuario =
          selectedVisita.id_usuario ??
          selectedVisita.usuario?.id ??
          user?.id ??
          0;

        await VisitasService.updateVisita(selectedVisita.id, {
          ...payload,
          id_usuario: idUsuario,
        });
      } else {
        await VisitasService.createVisita({
          ...payload,
          id_usuario: user?.id ?? 0,
        });
      }
      await refreshVisitas();
      closeModal();
      showSuccessAlert("Visita guardada");
    } catch (error) {
      showErrorAlert(error, "Guardar Visita");
      console.error(error);
    }
  };

  const handleBorrarVisita = async (visita: Visita) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta visita?")) {
      return;
    }

    try {
      await VisitasService.deleteVisita(visita.id);
      await refreshVisitas();
      showSuccessAlert("Visita eliminada");
    } catch (error) {
      showErrorAlert(error, "Eliminar Visita");
      console.error(error);
    }
  };

  const getBuildingLabel = (visita: Visita) => {
    const cliente = visita.cliente;
    if (!cliente) return "Cliente eliminado";
    const edificio = cliente.edificios?.[0];
    return edificio?.direccion_completa ?? "Edificio no disponible";
  };

  const statusOptions = visitas
    ? Array.from(
        new Set(
          visitas
            .map((visita) => visita.estado?.etiqueta?.trim() ?? "")
            .filter(Boolean)
        )
      )
    : [];

  const filteredVisitas = visitas?.filter((visita) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = user?.rol === "admin"
      ? [visita.usuario?.nombre, visita.usuario?.apellidos]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      : visita.cliente
          ? [visita.cliente.nombre, visita.cliente.apellidos]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query)
          : false;

    const statusName = visita.estado?.etiqueta?.toLowerCase() ?? "";
    const matchesStatus = statusFilter === "all" || statusName === statusFilter;

    return matchesSearch && matchesStatus;
  }) ?? [];

  const getCardStyle = (colorHex?: string) => ({
    borderColor: colorHex ?? "#3f1b1b",
    background: colorHex
      ? `linear-gradient(180deg, ${colorHex}22 0%, rgba(19, 19, 29, 0.96) 100%)`
      : "linear-gradient(180deg, rgba(12, 12, 22, 0.98) 0%, rgba(19, 19, 29, 0.96) 100%)",
    boxShadow: colorHex ? `0 10px 30px ${colorHex}33` : "0 10px 30px rgba(0,0,0,0.22)",
  });

  return (
    <>
      <Sidebar />

      <main className="visitas-page">
        <VisitasHeader
          userRole={user?.rol}
          search={search}
          statusFilter={statusFilter}
          statusOptions={statusOptions}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
        />

        {visitas ? (
          user?.rol === "admin" ? (
            <VisitasAdminGrid
              visitas={filteredVisitas}
              getBuildingLabel={getBuildingLabel}
              getCardStyle={getCardStyle}
              onDelete={handleBorrarVisita}
            />
          ) : (
            <VisitasComercialGrid
              visitas={filteredVisitas}
              getBuildingLabel={getBuildingLabel}
              getCardStyle={getCardStyle}
              onEdit={openEditModal}
            />
          )
        ) : null}
      </main>

      <VisitaFormularioModal
        key={isModalOpen ? selectedVisita?.id ?? "create" : "closed"}
        open={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSaveVisita}
        clientes={availableClients}
        estados={estados}
        initialValues={selectedVisita ? {
          id_cliente: selectedVisita.id_cliente,
          fecha_hora: selectedVisita.fecha_hora,
          id_estado: selectedVisita.id_estado,
          observaciones: selectedVisita.observaciones ?? "",
        } : undefined}
        selectedClient={selectedVisita?.cliente ?? undefined}
        mode={selectedVisita ? "edit" : "create"}
      />
    </>
  );
};

export default Visitas;
