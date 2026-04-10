import { useState, useEffect } from "react";
import type { Edificio } from "../types/edificios/Edificio";
import type { Cliente } from "../types/clientes/Cliente";
import type { Zona } from "../types/zonas/Zona";
import { InicioService } from "../services/InicioService";
import "../styles/MapaEdificioPanel.css";

interface MapaEdificioPanelProps {
  edificio: Edificio;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

interface ClienteEnEdificio {
  cliente: Cliente;
  planta: string | null;
  puerta: string | null;
}

const MapaEdificioPanel = ({
  edificio,
  isOpen,
  onClose,
  userRole = "admin",
}: MapaEdificioPanelProps) => {
  const [clientesBloque, setClientesBloque] = useState<ClienteEnEdificio[]>([]);
  const [zona, setZona] = useState<Zona | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !edificio) return;

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Una sola petición trae el edificio con zona y clientes
        const detalleData = await InicioService.getDetalleEdificio(edificio.id);
        setZona(detalleData.zona);

        // Procesar clientes del edificio
        const clientesFormateados: ClienteEnEdificio[] = (
          detalleData.edificio.clientes || []
        ).map((cliente) => ({
          cliente,
          planta: cliente.planta || null,
          puerta: cliente.puerta || null,
        }));

        setClientesBloque(clientesFormateados);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [isOpen, edificio]);

  if (!isOpen) return null;

  return (
    <div className="mapa-edificio-panel-overlay" onClick={onClose}>
      <div
        className="mapa-edificio-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mapa-edificio-panel-header">
          <h2 className="mapa-edificio-panel-title">Detalles del Edificio</h2>
          <button className="mapa-edificio-panel-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="mapa-edificio-panel-content">
          {/* Información del edificio */}
          <div className="mapa-edificio-section">
            <h3 className="mapa-edificio-section-title">Información</h3>
            <div className="mapa-edificio-info">
              <div className="mapa-edificio-info-row">
                <span className="mapa-edificio-label">Dirección:</span>
                <span className="mapa-edificio-value">
                  {edificio.direccion_completa}
                </span>
              </div>
              <div className="mapa-edificio-info-row">
                <span className="mapa-edificio-label">Tipo:</span>
                <span className="mapa-edificio-value">{edificio.tipo}</span>
              </div>
              {userRole === "admin" && zona && (
                <div className="mapa-edificio-info-row">
                  <span className="mapa-edificio-label">Zona:</span>
                  <span className="mapa-edificio-value">{zona.nombre_zona}</span>
                </div>
              )}
            </div>
          </div>

          {/* Clientes */}
          <div className="mapa-edificio-section">
            <h3 className="mapa-edificio-section-title">
              Clientes ({clientesBloque.length})
            </h3>

            {loading ? (
              <div className="mapa-edificio-loading">Cargando clientes...</div>
            ) : error ? (
              <div className="mapa-edificio-error">Error: {error}</div>
            ) : clientesBloque.length === 0 ? (
              <div className="mapa-edificio-empty">No hay clientes</div>
            ) : (
              <ul className="mapa-edificio-clientes-list">
                {clientesBloque.map(({ cliente, planta, puerta }) => (
                  <li
                    key={`cliente-${cliente.id}-${planta}-${puerta}`}
                    className="mapa-edificio-cliente-item"
                  >
                    <div className="mapa-edificio-cliente-nombre">
                      {cliente.nombre} {cliente.apellidos}
                    </div>
                    <div className="mapa-edificio-cliente-meta">
                      Piso: {planta ?? "-"} • Puerta: {puerta ?? "-"}
                    </div>
                    <div className="mapa-edificio-cliente-contacto">
                      <span className="contacto-telefono">
                        📱 {cliente.telefono ?? "N/A"}
                      </span>
                      <span className="contacto-email">
                        {cliente.email ?? "N/A"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaEdificioPanel;
