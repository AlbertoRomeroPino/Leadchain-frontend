import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import Sidebar from "../layout/Sidebar";
import { VisitasService } from "../services/VisitasService";
import { useInitialize } from "../hooks/useInitialize";
import type { Visita } from "../types/visitas/Visita";
import type { Cliente } from "../types/clientes/Cliente";
import type { EstadoVisita } from "../types/visitas/EstadoVisita";
import VisitaFormularioModal from "../components/Visitas/FormularioModal/VisitaFormularioModal";
import { MapPinPlusInside, MapPinPen, Trash2 } from "lucide-react";
import "../styles/VisitasPage.css";

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
      // Una sola petición consolida visitas, clientes y estados
      const data = await VisitasService.getVisitasPaginaDatos();

      setVisitas(data.visitas);
      setClientes(data.clientes);
      setEstados(data.estados);
    } catch (error) {
      console.error(error);
    }
  });

  const availableClients = clientes;

  const openCreateModal = () => {
    setSelectedVisita(null);
    setIsModalOpen(true);
  };

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
        await VisitasService.updateVisita(selectedVisita.id, {
          ...payload,
          id_usuario: selectedVisita.id_usuario,
        });
      } else {
        await VisitasService.createVisita({
          ...payload,
          id_usuario: user?.id ?? 0,
        });
      }
      await refreshVisitas();
      closeModal();
    } catch (error) {

      alert(`No se pudo guardar la visita.${user?.id} Comprueba los datos e inténtalo de nuevo.`);
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
    } catch (error) {
      alert("No se pudo eliminar la visita. Inténtalo de nuevo más tarde.");
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
        <div className="visitas-page-header">
          <div>
            <h1>Visitas</h1>
            <div className="visitas-actions">
              {user?.rol === "comercial" && (
                <button type="button" onClick={openCreateModal} className="visitas-action-button">
                  <MapPinPlusInside />
                </button>
              )}
            </div>
          </div>
          <div>
            <div className="visitas-search-row">
              <div className="visitas-search-wrapper">
                <label htmlFor="search-user" className="visitas-search-label">
                  {user?.rol === "admin" ? "Buscar por usuario" : "Buscar por cliente"}
                </label>
                <input
                  id="search-user"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="visitas-search-input"
                  placeholder={
                    user?.rol === "admin"
                      ? "Nombre o apellidos del usuario"
                      : "Nombre o apellidos del cliente"
                  }
                />
              </div>
              <div className="visitas-status-wrapper">
                <label htmlFor="status-filter" className="visitas-search-label">
                  Filtrar por estado
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="visitas-search-input"
                >
                  <option value="all">Todos los estados</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status.toLowerCase()}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {visitas ? (
          <div
            className={`visitas-grid ${user?.rol === "admin" ? "admin-visitas-grid" : "comercial-visitas-grid"}`}
          >
            {filteredVisitas.map((visita) =>
              user?.rol === "admin" ? (
                <article
                  key={visita.id}
                  className="admin-visita-card"
                  style={getCardStyle(visita.estado?.color_hex)}
                >
                  <div className="admin-visita-header">
                    <div>
                      <div className="admin-visita-title">
                        {visita.usuario ? `${visita.usuario.nombre} ${visita.usuario.apellidos}` : "Usuario desconocido"}
                      </div>
                      <div className="admin-visita-subtitle">
                        {visita.cliente ? `${visita.cliente.nombre} ${visita.cliente.apellidos}` : "Cliente eliminado"}
                      </div>
                      <div className="admin-visita-status-text">
                        Estado: {visita.estado?.etiqueta ?? "Sin estado"}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="visita-card-action-button"
                      onClick={() => handleBorrarVisita(visita)}
                      title="Borrar visita"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="admin-visita-grid">
                    <div>
                      <div className="admin-visita-label">Edificio</div>
                      <div className="admin-visita-value">{getBuildingLabel(visita)}</div>
                    </div>
                    <div>
                      <div className="admin-visita-label">Fecha</div>
                      <div className="admin-visita-value">{new Date(visita.fecha_hora).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="admin-visita-info">
                    <div>
                      <div className="admin-visita-label">Observaciones</div>
                      <div className="admin-visita-value">{visita.observaciones?.trim() || "Ninguna"}</div>
                    </div>
                  </div>
                </article>
              ) : (
                <article
                  key={visita.id}
                  className="visita-postit"
                  style={getCardStyle(visita.estado?.color_hex)}
                >
                  <div className="visita-postit-header">
                    <div>
                      <div className="visita-postit-title">
                        {visita.cliente ? `${visita.cliente.nombre} ${visita.cliente.apellidos}` : "Cliente eliminado"}
                      </div>
                      <div className="visita-postit-subtitle">{getBuildingLabel(visita)}</div>
                      <div className="visita-state-text">
                        Estado: {visita.estado?.etiqueta ?? "Sin estado"}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="visita-card-action-button"
                      onClick={() => openEditModal(visita)}
                      title="Editar visita"
                    >
                      <MapPinPen size={18} />
                    </button>
                  </div>

                  <div className="visita-observaciones">
                    <strong>Observaciones:</strong> {visita.observaciones?.trim() || "Ninguna"}
                  </div>

                  <div className="visita-postit-footer">
                    <span className="visita-state-label">{visita.estado?.etiqueta ?? "Estado"}</span>
                    <span className="visita-date">{new Date(visita.fecha_hora).toLocaleString()}</span>
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <p>Cargando visitas...</p>
        )}
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
