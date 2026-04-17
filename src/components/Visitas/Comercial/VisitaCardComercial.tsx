import type { Visita } from "../../../types/visitas/Visita";
import type { CSSProperties } from "react";
import { MapPinPen } from "lucide-react";
import "../../../styles/components/Visitas/Comercial/VisitaCardComercial.css";

type VisitaCardComercialProps = {
  visita: Visita;
  buildingLabel: string;
  style: CSSProperties;
  onEdit: (visita: Visita) => void;
  isLoading?: boolean;
};

const VisitaCardComercial = ({ visita, buildingLabel, style, onEdit, isLoading = false }: VisitaCardComercialProps) => (
  <article key={visita.id} className="visita-postit" style={style}>
    <div className="visita-postit-header">
      <div>
        <div className="visita-postit-title">
          {visita.cliente ? `${visita.cliente.nombre} ${visita.cliente.apellidos}` : "Cliente eliminado"}
        </div>
        <div className="visita-postit-subtitle">{buildingLabel}</div>
        <div className="visita-state-text">
          Estado: {visita.estado?.etiqueta ?? "Sin estado"}
        </div>
      </div>
      <button
        type="button"
        className="visita-card-action-button"
        onClick={() => onEdit(visita)}
        title="Editar visita"
        disabled={isLoading}
      >
        <MapPinPen size={18} />
      </button>
    </div>

    <div className="visita-observaciones">
      <strong>Observaciones:</strong> {visita.observaciones?.trim() || "Ninguna"}
    </div>

    <div className="visita-postit-footer">
      <span className="visita-state-label">{visita.estado?.etiqueta ?? "Estado"}</span>
      <span className="visita-date">{new Date(visita.fecha_hora).toLocaleDateString()}</span>
    </div>
  </article>
);

export default VisitaCardComercial;
