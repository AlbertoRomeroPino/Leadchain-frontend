import React from "react";
import type { Visita } from "../../types/visitas/Visita";
import type { UserVisitas } from "../../types/users/User";
import "../../styles/components/Comerciales/ComercialesRow.css";

interface ComercialesRowProps {
  comercial: UserVisitas;
  zonaNombre: string;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ComercialesRow = ({
  comercial,
  zonaNombre,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
}: ComercialesRowProps) => {

  const nombreCompleto = function () {
    // si el nombre y apellidos del comercial es de mas de 40 caracteres en total, se capa a 40 caracteres y se añade "..." al final
    const nombreCompleto = `${comercial.nombre} ${comercial.apellidos}`;
    if (nombreCompleto.length > 40) {
      return nombreCompleto.slice(0, 40) + "...";
    }
    return nombreCompleto;
  }

  return (
    <>
      <tr className="comerciales-row" onClick={onToggleExpand}>
        <td>
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={onToggleSelect}
          />
        </td>
        <td>
          {nombreCompleto()}
        </td>
        <td>{comercial.email}</td>
        <td>{zonaNombre || "-"}</td>
        <td>{comercial.visitas.length}</td>
      </tr>

      {isExpanded ? (
        <tr className="comerciales-subrow">
          <td colSpan={5}>
            <div className="comerciales-list-visitas">
              {comercial.visitas.length ? (
                <div className="visitas-grid">
                  {comercial.visitas.map((v: Visita) => (
                    <div key={v.id} className="visita-card">
                      <div className="visita-card-row">
                        <span className="visita-card-label">Fecha:</span>
                        <span>{new Date(v.fecha_hora).toLocaleString()}</span>
                      </div>
                      <div className="visita-card-row">
                        <span className="visita-card-label">Cliente:</span>
                        <span>
                          {v.cliente
                            ? `${v.cliente.nombre} ${v.cliente.apellidos}`
                            : `ID ${v.id_cliente}`}
                        </span>
                      </div>
                      <div className="visita-card-row">
                        <span className="visita-card-label">Estado:</span>
                        <span>{v.estado?.etiqueta ?? `#${v.id_estado}`}</span>
                      </div>
                      {v.observaciones && (
                        <div className="visita-card-row">
                          <span className="visita-card-label">Observaciones:</span>
                          <span>{v.observaciones}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sin-visitas">Sin visitas registradas</p>
              )}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
};

export default ComercialesRow;
