import { useState, useEffect } from "react";
import type { Cliente } from "../../../types/clientes/Cliente";
import type { Visita } from "../../../types/visitas/Visita";
import type { EstadoVisita } from "../../../types/visitas/EstadoVisita";
import type { Edificio } from "../../../types/edificios/Edificio";
import { VisitasService } from "../../../services/VisitasService";
import { EstadoVisitaService } from "../../../services/EstadoVisitaService";
import { EdificiosService } from "../../../services/EdificiosService";
import { useAuth } from "../../../auth/useAuth";
import VisitaFormularioModal from "../../Visitas/FormularioModal/VisitaFormularioModal";
import type { VisitaFormValues } from "../../Visitas/FormularioModal/VisitaFormularioModal";

interface ClienteSinVisita {
  cliente: Cliente;
  tieneVisita: boolean;
  ultimaVisita?: Visita;
  edificio?: Edificio;
}

interface ClientesSinVisitarProps {
  clientes: ClienteSinVisita[];
  loading: boolean;
  onVisitaCreada: () => void;
}

const ClientesSinVisitar = ({
  clientes: clientesData,
  loading,
  onVisitaCreada,
}: ClientesSinVisitarProps) => {
  const { user } = useAuth();
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estados, setEstados] = useState<EstadoVisita[]>([]);
  const [clientes, setClientes] = useState<ClienteSinVisita[]>([]);

  useEffect(() => {
    const cargarEdificios = async () => {
      try {
        const estadosData = await EstadoVisitaService.getEstadosVisita();
        setEstados(estadosData);

        const edificiosData = await EdificiosService.getEdificios();

        // Mapear edificios a clientes
        const clientesConEdificio = clientesData.map((c) => {
          const edificio = edificiosData.find((e) =>
            e.clientes?.some((cliente) => cliente.id === c.cliente.id)
          );
          return {
            ...c,
            edificio,
          };
        });

        setClientes(clientesConEdificio);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setClientes(clientesData);
      }
    };
    cargarEdificios();
  }, [clientesData]);

  const clientesSinVisita = clientes.filter((c) => !c.tieneVisita);
  const clientesConVisita = clientes.filter((c) => c.tieneVisita);

  const handleCrearVisita = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setClienteSeleccionado(null);
    setIsModalOpen(false);
  };

  const handleSubmitVisita = async (values: VisitaFormValues) => {
    try {
      await VisitasService.createVisita({
        ...values,
        id_usuario: user?.id ?? 0,
      });
      handleCloseModal();
      onVisitaCreada();
    } catch (error) {
      console.error("Error al crear visita:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="clientes-sin-visitar-container">
        <div className="clientes-loading">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="clientes-sin-visitar-container">
      {/* Header con estadísticas */}
      <div className="clientes-header">
        <div className="clientes-stat">
          <span className="stat-label">Total Clientes</span>
          <span className="stat-value">{clientes.length}</span>
        </div>
        <div className="clientes-stat">
          <span className="stat-label">Con Visita</span>
          <span className="stat-value stat-green">{clientesConVisita.length}</span>
        </div>
        <div className="clientes-stat">
          <span className="stat-label">Sin Visita</span>
          <span className="stat-value stat-red">{clientesSinVisita.length}</span>
        </div>
        <div className="clientes-stat">
          <span className="stat-label">Cobertura</span>
          <span className="stat-value">
            {clientes.length > 0
              ? Math.round((clientesConVisita.length / clientes.length) * 100)
              : 0}
            %
          </span>
        </div>
      </div>

      {/* Lista de clientes sin visita */}
      <div className="clientes-section">
        <h2 className="clientes-section-title">Clientes sin Visita</h2>

        {clientesSinVisita.length === 0 ? (
          <div className="clientes-empty">
            ✅ ¡Excelente! Todos tus clientes tienen visitas registradas.
          </div>
        ) : (
          <div className="clientes-grid">
            {clientesSinVisita.map((item) => (
              <div key={item.cliente.id} className="cliente-card">
                <div className="cliente-card-header">
                  <h3 className="cliente-card-name">
                    {item.cliente.nombre} {item.cliente.apellidos}
                  </h3>
                </div>

                <div className="cliente-card-content">
                  {/* Edificio */}
                  {item.edificio && (
                    <div className="cliente-card-field">
                      <span className="field-label">🏢 Edificio</span>
                      <span className="field-value">{item.edificio.direccion_completa}</span>
                      {(item.edificio.planta || item.edificio.puerta) && (
                        <span className="field-value-small">
                          {item.edificio.planta && `Planta ${item.edificio.planta}`}
                          {item.edificio.planta && item.edificio.puerta && " - "}
                          {item.edificio.puerta && `Puerta ${item.edificio.puerta}`}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Teléfono */}
                  <div className="cliente-card-field">
                    <span className="field-label">📱 Teléfono</span>
                    <span className="field-value">{item.cliente.telefono || "N/A"}</span>
                  </div>

                  {/* Email */}
                  <div className="cliente-card-field">
                    <span className="field-label">📧 Email</span>
                    <span className="field-value">{item.cliente.email || "N/A"}</span>
                  </div>
                </div>

                <div className="cliente-card-footer">
                  <button
                    className="btn-crear-visita"
                    onClick={() => handleCrearVisita(item.cliente)}
                  >
                    + Crear Visita
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de clientes con visita */}
      {clientesConVisita.length > 0 && (
        <div className="clientes-section">
          <h2 className="clientes-section-title">
            Clientes con Visita ({clientesConVisita.length})
          </h2>
          <div className="clientes-grid">
            {clientesConVisita.map((item) => (
              <div key={item.cliente.id} className="cliente-card cliente-card-completed">
                <div className="cliente-card-header">
                  <h3 className="cliente-card-name">
                    ✓ {item.cliente.nombre} {item.cliente.apellidos}
                  </h3>
                </div>

                <div className="cliente-card-content">
                  {/* Edificio */}
                  {item.edificio && (
                    <div className="cliente-card-field">
                      <span className="field-label">🏢 Edificio</span>
                      <span className="field-value">{item.edificio.direccion_completa}</span>
                    </div>
                  )}

                  {/* Última visita */}
                  <div className="cliente-card-field">
                    <span className="field-label">📅 Última Visita</span>
                    <span className="field-value">
                      {item.ultimaVisita
                        ? new Date(item.ultimaVisita.fecha_hora).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para crear visita */}
      <VisitaFormularioModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitVisita}
        clientes={clientes.map((c) => c.cliente)}
        estados={estados}
        selectedClient={clienteSeleccionado}
        mode="create"
      />
    </div>
  );
};

export default ClientesSinVisitar;
