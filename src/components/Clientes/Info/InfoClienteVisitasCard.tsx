import type { Visita } from "../../../types";
import "../../../styles/components/Clientes/Info/InfoClienteVisitasCard.css";

interface InfoClienteVisitasCardProps {
  totalVisitas: number;
  ultimaVisita: Visita | null;
  ultimoEstado: string;
  ultimoUsuario: string;
}

const formatDate = (dateValue?: string) => {
  if (!dateValue) return "–";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "–";
  return date.toLocaleString("es-ES");
};

const InfoClienteVisitasCard = ({
  totalVisitas,
  ultimaVisita,
  ultimoEstado,
  ultimoUsuario,
}: InfoClienteVisitasCardProps) => {
  return (
    <article className="info-cliente-card info-cliente-card-visita">
      <h2 className="info-cliente-subtitle">Visitas</h2>
      <div className="info-cliente-grid">
        <p className="info-cliente-line">
          <strong>Total visitas:</strong>{" "}
          {totalVisitas > 0 ? totalVisitas : "No tiene visitas"}
        </p>
        <p className="info-cliente-line">
          <strong>Fecha última visita:</strong>{" "}
          {formatDate(ultimaVisita?.fecha_hora) ?? "-"}
        </p>
        <p className="info-cliente-line">
          <strong>Estado última visita:</strong>{" "}
          <span
            className="info-cliente-state"
            style={{
              borderColor: ultimaVisita?.estado?.color_hex ?? "#64748B",
            }}
          >
            {ultimoEstado ? ultimoEstado : "-"}
          </span>
        </p>
        <p className="info-cliente-line">
          <strong>Último usuario:</strong> {ultimoUsuario}
        </p>
      </div>
      <p className="info-cliente-line">
        <strong>Observaciones:</strong>{" "}
        {ultimaVisita?.observaciones?.trim() || "Sin observaciones"}
      </p>
    </article>
  );
};

export default InfoClienteVisitasCard;
