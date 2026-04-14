import type { Visita } from "../../../types/visitas/Visita";
import type { CSSProperties } from "react";
import VisitaCardComercial from "./VisitaCardComercial";

type VisitasComercialGridProps = {
  visitas: Visita[];
  getBuildingLabel: (visita: Visita) => string;
  getCardStyle: (colorHex?: string) => CSSProperties;
  onEdit: (visita: Visita) => void;
};

const VisitasComercialGrid = ({
  visitas,
  getBuildingLabel,
  getCardStyle,
  onEdit,
}: VisitasComercialGridProps) => (
  <div className="visitas-grid comercial-visitas-grid">
    {visitas.map((visita) => (
      <VisitaCardComercial
        key={visita.id}
        visita={visita}
        buildingLabel={getBuildingLabel(visita)}
        style={getCardStyle(visita.estado?.color_hex)}
        onEdit={onEdit}
      />
    ))}
  </div>
);

export default VisitasComercialGrid;
