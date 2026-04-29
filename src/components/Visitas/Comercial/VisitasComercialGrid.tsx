import { useState, useMemo, useCallback } from "react";
import VisitasHeaderComercial from "./VisitaHeaderComercial";
import VisitaCardComercial from "./VisitaCardComercial";
import { showErrorAlert, showLoadingAlert, showSuccessAlert } from "../../utils/errorHandler";
import { VisitasService } from "../../../services/VisitasService";
import VisitaFormularioModal from "../FormularioModal/VisitaFormularioModal";
import { useAuth } from "../../../context/useAuth";
import { useInitialize } from "../../../hooks/useInitialize";
import type { Cliente, EstadoVisita, Visita } from "../../../types";
import "../../../styles/components/Visitas/Comercial/VisitasComercialGrid.css";

const VisitasComercialGrid = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estados, setEstados] = useState<EstadoVisita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Memoizamos las opciones de estado para evitar cálculos innecesarios en cada render
  // Esto mejora el "Tiempo de interacción" al reducir la carga del hilo principal.
  const statusOptions = useMemo(() => {
    if (!visitas) return [];
    return Array.from(
      new Set(
        visitas
          .map((visita) => visita.estado?.etiqueta?.trim() ?? "")
          .filter(Boolean)
      )
    );
  }, [visitas]);

  // Optimizamos el filtrado con useMemo. 
  // La búsqueda ahora es más flexible (nombre o apellidos) para mejorar el "Valor al contenido".
  const filteredVisitas = useMemo(() => {
    if (!visitas) return [];
    const query = search.trim().toLowerCase();
    const filter = statusFilter.toLowerCase();

    return visitas.filter((visita) => {
      const fullUserName = `${visita.cliente?.nombre ?? ""} ${visita.cliente?.apellidos ?? ""}`.toLowerCase();
      const matchesSearch = fullUserName.includes(query);

      const statusName = visita.estado?.etiqueta?.toLowerCase() ?? "";
      const matchesStatus = filter === "all" || statusName === filter;

      return matchesSearch && matchesStatus;
    });
  }, [visitas, search, statusFilter]);

  const openEditModal = (visita: Visita) => {
    setSelectedVisita(visita);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVisita(null);
    setIsModalOpen(false);
  };

  const availableClients = clientes;

  // Sincronizamos la recarga de datos para evitar duplicidad de lógica
  const refreshVisitas = useCallback(async () => {
    try {
      const data = await VisitasService.getVisitasPaginaDatos();
      setVisitas(data.visitas ?? []);
      setEstados(data.estados ?? []);
      setClientes(data.clientes ?? []);
    } catch (error) {
      console.error("Error al refrescar visitas:", error);
    }
  }, []);

  const handleSaveVisita = async (payload: {
    id_cliente: number;
    fecha_hora: string;
    id_estado: number;
    observaciones: string;
  }) => {
    try {
      showLoadingAlert(selectedVisita ? "Actualizando visita..." : "Creando visita...");
      
      // Creamos el objeto final integrando el id_usuario
      const dataToSave = {
        ...payload,
        id_usuario: user?.id ?? 0 // Obtenemos el ID del usuario logueado
      };

      if (selectedVisita) {
        await VisitasService.updateVisita(selectedVisita.id, dataToSave);
      } else {
        await VisitasService.createVisita(dataToSave);
      }
      
      await refreshVisitas();
      closeModal();
      showSuccessAlert("Visita guardada con éxito");
    } catch (error) {
      showErrorAlert(error, "Guardar Visita");
      
    }
  };

  useInitialize(async () => {
    try {
      showLoadingAlert("Cargando información...");
      await refreshVisitas();
      showSuccessAlert("Información cargada");
    } catch (error) {
      showErrorAlert(error, "Cargar Visitas");
      
    }
  });

  // Estilos dinámicos optimizados para "Legibilidad de fuente" y "Contraste"
  const getCardStyle = (colorHex?: string) => ({
    borderColor: colorHex ?? "#3f1b1b",
    background: colorHex
      ? `linear-gradient(180deg, ${colorHex}15 0%, rgba(19, 19, 29, 0.98) 100%)`
      : "linear-gradient(180deg, rgba(12, 12, 22, 0.98) 0%, rgba(19, 19, 29, 0.96) 100%)",
    boxShadow: colorHex
      ? `0 10px 30px ${colorHex}22`
      : "0 10px 30px rgba(0,0,0,0.22)",
    transition: "transform 0.2s ease",
  });

  const getBuildingLabel = (visita: Visita) => {
    const cliente = visita.cliente;
    if (!cliente) return "Cliente no identificado";
    const edificio = cliente.edificios?.[0];
    return edificio?.direccion_completa ?? "Sin dirección registrada";
  };

  return (
    <>
      <main className="visitas-page">
        <VisitasHeaderComercial
          search={search}
          statusFilter={statusFilter}
          statusOptions={statusOptions}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
        />

        <div className="visitas-grid comercial-visitas-grid">
          {filteredVisitas.map((visita) => (
            <VisitaCardComercial
              key={visita.id}
              visita={visita}
              buildingLabel={getBuildingLabel(visita)}
              style={getCardStyle(visita.estado?.color_hex)}
              onEdit={openEditModal}
              // isLoading={isLoading}
            />
          ))}
        </div>
      </main>

      <VisitaFormularioModal
        key={isModalOpen ? (selectedVisita?.id ?? "create") : "closed"}
        open={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSaveVisita}
        clientes={availableClients}
        estados={estados}
        initialValues={
          selectedVisita
            ? {
                id_cliente: selectedVisita.id_cliente,
                fecha_hora: selectedVisita.fecha_hora,
                id_estado: selectedVisita.id_estado,
                observaciones: selectedVisita.observaciones ?? "",
              }
            : undefined
        }
        selectedClient={selectedVisita?.cliente ?? undefined}
        mode={selectedVisita ? "edit" : "create"}
      />
    </>
  );
};

export default VisitasComercialGrid;