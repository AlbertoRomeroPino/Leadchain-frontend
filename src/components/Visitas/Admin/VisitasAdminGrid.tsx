import type { Visita } from "../../../types/visitas/Visita";
import type { CSSProperties } from "react";
import VisitaCardAdmin from "./VisitaCardAdmin";

type VisitasAdminGridProps = {
  visitas: Visita[];
  getBuildingLabel: (visita: Visita) => string;
  getCardStyle: (colorHex?: string) => CSSProperties;
  onDelete: (visita: Visita) => void;
};

const VisitasAdminGrid = ({
  visitas,
  getBuildingLabel,
  getCardStyle,
  onDelete,
}: VisitasAdminGridProps) => (
  <div className="visitas-grid admin-visitas-grid">
    {visitas.map((visita) => (
      <VisitaCardAdmin
        key={visita.id}
        visita={visita}
        buildingLabel={getBuildingLabel(visita)}
        style={getCardStyle(visita.estado?.color_hex)}
        onDelete={onDelete}
      />
    ))}
  </div>
);

export default VisitasAdminGrid;
