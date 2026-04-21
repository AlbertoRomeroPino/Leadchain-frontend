import type { Visita } from "../../../types/visitas/Visita";
import type { CSSProperties } from "react";
import { Trash2 } from "lucide-react";
import "../../../styles/components/Visitas/Admin/VisitaCardAdmin.css";

type VisitaCardAdminProps = {
  visita: Visita;
  buildingLabel: string;
  style: CSSProperties;
  onDelete: (visita: Visita) => void;
};

const ComercialNombreCompleto = (visita: Visita) => {
  const nombreCompleto = `${visita.usuario?.nombre ?? "Usuario"} ${visita.usuario?.apellidos ?? ""}`.trim();

  if (nombreCompleto.length > 40) {
    if (visita.usuario?.apellidos === "Sin apellidos") {
      return `${visita.usuario?.nombre?.slice(0, 40) ?? ""}...`;
    }
    return `${nombreCompleto.slice(0, 40)}...`;
  }

  if (visita.usuario?.apellidos === "Sin apellidos") {
    return visita.usuario?.nombre ?? "Usuario";
  }

  return nombreCompleto;
};

const ClienteNombreCompleto = (visita: Visita) => {
  const nombreCompleto = `${visita.cliente?.nombre ?? "Cliente"} ${visita.cliente?.apellidos ?? ""}`.trim();

  if (nombreCompleto.length > 40) {
    if (visita.cliente?.apellidos === "Sin apellidos") {
      return `${visita.cliente?.nombre?.slice(0, 40) ?? ""}...`;
    }
    return `${nombreCompleto.slice(0, 40)}...`;
  }

  if (visita.cliente?.apellidos === "Sin apellidos") {
    return visita.cliente?.nombre ?? "Cliente";
  }

  return nombreCompleto;
};

const VisitaCardAdmin = ({ visita, buildingLabel, style, onDelete }: VisitaCardAdminProps) => (
  <article key={visita.id} className="admin-visita-card" style={style}>
    <div className="admin-visita-header">
      <div>
        <div className="admin-visita-title">
          {visita.usuario ? ComercialNombreCompleto(visita) : "Usuario desconocido"}
        </div>
        <div className="admin-visita-subtitle">
          {visita.cliente ? ClienteNombreCompleto(visita) : "Cliente eliminado"}
        </div>
        <div className="admin-visita-status-text">
          Estado: {visita.estado?.etiqueta ?? "Sin estado"}
        </div>
      </div>
      <button
        type="button"
        className="visita-card-action-button"
        onClick={() => onDelete(visita)}
        title="Borrar visita"
      >
        <Trash2 size={18} />
      </button>
    </div>

    <div className="admin-visita-grid">
      <div>
        <div className="admin-visita-label">Edificio</div>
        <div className="admin-visita-value">{buildingLabel}</div>
      </div>
      <div>
        <div className="admin-visita-label">Fecha</div>
        <div className="admin-visita-value">{new Date(visita.fecha_hora).toLocaleString()}</div>
      </div>
    </div>

    <div className="admin-visita-info">
      <div>
        <div className="admin-visita-label">Observaciones</div>
        <div className="admin-visita-value">{visita.observaciones?.trim() || "Ninguna"}</div>
      </div>
    </div>
  </article>
);

export default VisitaCardAdmin;
