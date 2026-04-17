import "../../../../styles/components/Inicio/InicioAdmin/ComercialCard/ComercialCardIndividual.css";
import type { User } from "../../../../types/users/User";
import type { Zona } from "../../../../types/zonas/Zona";
import type { ComercialStats } from "./ComercialCard";
import ComercialStatsBars from "./ComercialStatsBars";

interface ComercialCardIndividualProps {
  comercial: User;
  stats: ComercialStats | null;
  zona: Zona | null;
}

const ComercialCardIndividual: React.FC<ComercialCardIndividualProps> = ({
  comercial,
  stats,
  zona,
}) => {
  const totalClientes = stats?.totalClientes ?? 0;
  const totalVisitas = stats?.totalVisitas ?? 0;
  const cobertura =
    totalClientes > 0 ? Math.round((totalVisitas / totalClientes) * 100) : 0;

  return (
    <div className="comercial-card-individual">
      <div className="comercial-card-header">
        <div className="comercial-card-left">
          <h4 className="comercial-card-name">
            {comercial.nombre} {comercial.apellidos}
          </h4>
          <p className="comercial-card-email">{comercial.email || "Email: N/A"}</p>
        </div>
        {zona && <span className="comercial-card-zone">{zona.nombre}</span>}
      </div>

      <div className="comercial-card-body">
        <div className="comercial-info-row">
          <div className="info-item">
            <span className="info-label">Clientes:</span>
            <span className="info-value">{totalClientes}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Visitas:</span>
            <span className="info-value">{totalVisitas}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Cobertura:</span>
            <span className="info-value">{cobertura}%</span>
          </div>
        </div>

        <ComercialStatsBars
          exitosos={stats?.exitosos ?? 0}
          rechazados={stats?.rechazados ?? 0}
          enProceso={stats?.enProceso ?? 0}
          totalVisitas={totalVisitas}
          totalClientes={totalClientes}
        />
      </div>
    </div>
  );
};

export default ComercialCardIndividual;
