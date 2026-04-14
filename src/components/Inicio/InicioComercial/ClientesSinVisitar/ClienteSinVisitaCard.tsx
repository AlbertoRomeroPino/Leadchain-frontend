import type { ClienteSinVisita } from "./ClientesSinVisitar";

interface ClienteSinVisitaCardProps {
  item: ClienteSinVisita;
  onCrearVisita: (clienteId: number) => void;
}

const ClienteSinVisitaCard = ({ item, onCrearVisita }: ClienteSinVisitaCardProps) => {
  return (
    <div className="cliente-card">
      <div className="cliente-card-header">
        <h3 className="cliente-card-name">
          {item.cliente.nombre} {item.cliente.apellidos}
        </h3>
      </div>
      <div className="cliente-card-content">
        {item.edificio && (
          <div className="cliente-card-field">
            <span className="field-label">Edificio</span>
            <span className="field-value">{item.edificio.direccion_completa}</span>
            {(item.edificio.planta || item.edificio.puerta) && (
              <span className="field-value-small">
                {item.edificio.planta && `Planta ${item.edificio.planta}`}
                {item.edificio.planta && item.edificio.puerta && " - "}
                {item.edificio.puerta && `Puerta ${item.edificio.puerta}`}
              </span>
            )}
          </div>
        )}

        <div className="cliente-card-field">
          <span className="field-label">Teléfono</span>
          <span className="field-value">{item.cliente.telefono || "N/A"}</span>
        </div>

        <div className="cliente-card-field">
          <span className="field-label">Email</span>
          <span className="field-value">{item.cliente.email || "N/A"}</span>
        </div>
      </div>
      <div className="cliente-card-footer">
        <button
          className="btn-crear-visita"
          onClick={() => onCrearVisita(item.cliente.id)}
        >
          + Crear Visita
        </button>
      </div>
    </div>
  );
};

export default ClienteSinVisitaCard;
