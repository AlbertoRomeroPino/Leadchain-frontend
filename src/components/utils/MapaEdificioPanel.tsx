import { useState, useRef, memo } from "react";
import type { Cliente, Zona, Edificio } from "../../types";
import { InicioService } from "../../services/InicioService";
import { useInitialize } from "../../hooks/useInitialize";
import { showLoadingAlert, showErrorAlert } from "./errorHandler";
import "../../styles/components/utils/MapaEdificioPanel.css";

interface MapaEdificioPanelProps {
  edificio: Edificio;
  isOpen: boolean;
  onClose: () => void;
  pixelCoords?: { x: number; y: number } | null;
  userRole?: string;
}

// 1. Restaurada la interfaz necesaria para el formateo de datos
interface ClienteEnEdificio {
  cliente: Cliente;
  planta: string | null;
  puerta: string | null;
}

interface MousePosition {
  x: number;
  y: number;
}

// 2. Mantenemos el memo() para evitar re-renderizados fantasma al mover el mapa
const MapaEdificioPanel = memo(({
  edificio,
  isOpen,
  onClose,
  pixelCoords,
  userRole = "admin",
}: MapaEdificioPanelProps) => {
  // 3. Restaurado el estado con el tipo ClienteEnEdificio
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

      const panelData = await InicioService.getDetalleEdificio(edificio.id);
      setZona(panelData.zona || null);

      // 4. Restaurado el mapeo de datos exacto que solicitaste
      // Nota: Si TS se queja de 'planta' o 'puerta' aquí, 
      // puedes tipar 'cliente' como '(cliente: any) =>' temporalmente
      const clientesFormateados: ClienteEnEdificio[] = (
        panelData.clientes || []
      ).map((cliente: Cliente & { planta?: string | null; puerta?: string | null }) => ({
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
    // 5. Mantenemos la optimización de Math.hypot nativo (más rápido)
    const dragDistance = Math.hypot(
      e.clientX - dragStartPos.current.x,
      e.clientY - dragStartPos.current.y
    );

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
        <div className="mapa-edificio-panel-header">
          <h2 className="mapa-edificio-panel-title">Detalles del Edificio</h2>
          <button className="mapa-edificio-panel-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="mapa-edificio-panel-content">
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

          <div className="mapa-edificio-section">
            <h3 className="mapa-edificio-section-title">
              Clientes ({clientesBloque.length})
            </h3>

            {clientesBloque.length === 0 ? (
              <div className="mapa-edificio-empty">No hay clientes</div>
            ) : (
              <ul className="mapa-edificio-clientes-list">
                {/* 6. Restaurado el renderizado desestructurado */}
                {clientesBloque.map(({ cliente, planta, puerta }) => (
                  <li
                    key={`cliente-detalle-${cliente.id}`}
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
});

MapaEdificioPanel.displayName = "MapaEdificioPanel";

export default MapaEdificioPanel;