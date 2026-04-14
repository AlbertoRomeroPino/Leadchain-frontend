import type { ClienteSinVisita } from "./ClientesSinVisitar";

interface ClienteConVisitaCardProps {
  item: ClienteSinVisita;
}

const ClienteConVisitaCard = ({ item }: ClienteConVisitaCardProps) => {
  return (
    <div className="cliente-card cliente-card-completed">
      <div className="cliente-card-header">
        <h3 className="cliente-card-name">
          ✓ {item.cliente.nombre} {item.cliente.apellidos}
        </h3>
      </div>
      <div className="cliente-card-content">
        {item.edificio && (
          <div className="cliente-card-field">
            <span className="field-label">Edificio</span>
            <span className="field-value">{item.edificio.direccion_completa}</span>
          </div>
        )}
        <div className="cliente-card-field">
          <span className="field-label">Última Visita</span>
          <span className="field-value">
            {item.ultimaVisita
              ? new Date(item.ultimaVisita.fecha_hora).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClienteConVisitaCard;
