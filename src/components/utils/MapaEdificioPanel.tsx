import { useState, useRef } from "react";
import type { Cliente } from "../../types/clientes/Cliente";
import type { Zona } from "../../types/zonas/Zona";
import { InicioService } from "../../services/InicioService";
import { useInitialize } from "../../hooks/useInitialize";
import { showLoadingAlert, showErrorAlert } from "./errorHandler";
import type { Edificio } from "../../types/edificios/Edificio";
import "../../styles/components/utils/MapaEdificioPanel.css";

interface MapaEdificioPanelProps {
  edificio: Edificio;
  isOpen: boolean;
  onClose: () => void;
  pixelCoords?: { x: number; y: number } | null;
  userRole?: string;
}

interface ClienteEnEdificio {
  cliente: Cliente;
  planta: string | null;
  puerta: string | null;
}

interface MousePosition {
  x: number;
  y: number;
}

const MapaEdificioPanel = ({
  edificio,
  isOpen,
  onClose,
  pixelCoords,
  userRole = "admin",
}: MapaEdificioPanelProps) => {
  const [clientesBloque, setClientesBloque] = useState<ClienteEnEdificio[]>([]);
  const [zona, setZona] = useState<Zona | null>(null);
  const dragStartPos = useRef<MousePosition>({ x: 0, y: 0 });

  useInitialize(async () => {
    if (!isOpen || !edificio) {
      setClientesBloque([]);
      setZona(null);
      return;
    }

    try {
      showLoadingAlert("Cargando datos del edificio...");

      // Panel ligero: solo zona y clientes
      const panelData = await InicioService.getDetalleEdificio(edificio.id);
      setZona(panelData.zona || null);

      // Procesar clientes del edificio
      const clientesFormateados: ClienteEnEdificio[] = (
        panelData.clientes || []
      ).map((cliente) => ({
        cliente,
        planta: cliente.planta || null,
        puerta: cliente.puerta || null,
      }));

      setClientesBloque(clientesFormateados);
    } catch (err) {
      showErrorAlert(err, "Cargar Edificio");
      console.error("Error al cargar datos:", err);
    }
  }, [isOpen, edificio?.id]);

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleOverlayMouseUp = (e: React.MouseEvent) => {
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.current.x, 2) +
        Math.pow(e.clientY - dragStartPos.current.y, 2)
    );

    // Solo cerrar si no fue un drag (menos de 5px de movimiento)
    if (dragDistance < 5 && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const panelStyle: React.CSSProperties = pixelCoords
    ? {
        position: 'fixed',
        left: `${pixelCoords.x}px`,
        top: `${pixelCoords.y - 10}px`,
        transform: 'translate(-50%, -100%)',
      }
    : {};

  return (
    <div 
      className="mapa-edificio-panel-overlay"
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div
        className="mapa-edificio-panel"
        style={panelStyle}
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
                  <span className="mapa-edificio-value">{zona.nombre}</span>
                </div>
              )}
            </div>
          </div>

          {/* Clientes */}
          <div className="mapa-edificio-section">
            <h3 className="mapa-edificio-section-title">
              Clientes ({clientesBloque.length})
            </h3>

            {clientesBloque.length === 0 ? (
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
