import { ArrowLeft, MapMinus, Pencil } from "lucide-react";
import "../../styles/components/Zona/ZonaInfo.css";
import type { Zona } from "../../types/zonas/Zona";
import ZonaDetails from "./ZonaDetails";
import ZonaMap from "./ZonaMap";

interface ZonaInfoProps {
  selectedZona: Zona;
  selectedEdificiosCount: number;
  selectedAssignedEdificiosCount: number;
  creatingZona: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

const ZonaInfo = ({
  selectedZona,
  selectedEdificiosCount,
  selectedAssignedEdificiosCount,
  creatingZona,
  onEdit,
  onDelete,
  onBack,
}: ZonaInfoProps) => (
  <div className="zona-info-screen">
    <div className="zona-info-header">
      <div className="zona-info-actions">
        <button className="zona-info-back-button" onClick={onBack}>
          <ArrowLeft size={16} />
          Volver al listado
        </button>
        <button
          className="zona-action-button zona-action-button--edit"
          onClick={onEdit}
          disabled={creatingZona}
        >
          <Pencil size={16} />
          Editar
        </button>
        <button
          className="zona-action-button zona-action-button--delete"
          onClick={onDelete}
          disabled={creatingZona}
        >
          <MapMinus size={16} />
          Borrar
        </button>
      </div>
    </div>

    <div className="zona-info-layout">
      <div className="zona-info-card">
        <ZonaDetails
          selectedZona={selectedZona}
          selectedEdificiosCount={selectedEdificiosCount}
          selectedAssignedEdificiosCount={selectedAssignedEdificiosCount}
          creatingZona={creatingZona}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      <div className="zona-map-card">
        <ZonaMap selectedZona={selectedZona} />
      </div>
    </div>
  </div>
);

export default ZonaInfo;
