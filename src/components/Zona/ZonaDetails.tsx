import type { Zona } from "../../types/zonas/Zona";

interface ZonaDetailsProps {
  selectedZona: Zona;
  selectedEdificiosCount: number;
  selectedAssignedEdificiosCount: number;
  creatingZona: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const ZonaDetails = ({
  selectedZona,
  selectedEdificiosCount,
  selectedAssignedEdificiosCount,
}: ZonaDetailsProps) => (
  <div className="zona-details-section">
    <div className="zona-details-card-header">
      <h3 className="zona-card-title">Información de la zona</h3>
      <p className="zona-card-subtitle">{selectedZona.nombre_zona}</p>
    </div>

    <div className="zona-details-content">
      <div className="zona-detail-row">
        <span>ID:</span>
        <strong>{selectedZona.id}</strong>
      </div>
      <div className="zona-detail-row">
        <span>Nombre:</span>
        <strong>{selectedZona.nombre_zona}</strong>
      </div>
      <div className="zona-detail-row">
        <span>Área puntos:</span>
        <strong>{selectedZona.area?.length ?? 0}</strong>
      </div>
      <div className="zona-detail-row">
        <span>Edificios:</span>
        <strong>{selectedEdificiosCount}</strong>
      </div>
      <div className="zona-detail-row">
        <span>Clientes asignados:</span>
        <strong>{selectedAssignedEdificiosCount}</strong>
      </div>
    </div>
  </div>
);

export default ZonaDetails;
