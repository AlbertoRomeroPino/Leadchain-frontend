import type { Visita } from "../../../types/visitas/Visita";
import type { CSSProperties } from "react";
import "../../../styles/components/Visitas/Comercial/VisitasComercialGrid.css";
import VisitaCardComercial from "./VisitaCardComercial";

type VisitasComercialGridProps = {
  visitas: Visita[];
  getBuildingLabel: (visita: Visita) => string;
  getCardStyle: (colorHex?: string) => CSSProperties;
  onEdit: (visita: Visita) => void;
  isLoading?: boolean;
};

const VisitasComercialGrid = ({
  visitas,
  getBuildingLabel,
  getCardStyle,
  onEdit,
  isLoading = false,
}: VisitasComercialGridProps) => (
  <div className="visitas-grid comercial-visitas-grid">
    {visitas.map((visita) => (
      <VisitaCardComercial
        key={visita.id}
        visita={visita}
        buildingLabel={getBuildingLabel(visita)}
        style={getCardStyle(visita.estado?.color_hex)}
        onEdit={onEdit}
        isLoading={isLoading}
      />
    ))}
  </div>
);

export default VisitasComercialGrid;
