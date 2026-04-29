import React from "react";
import type { Zona, UserVisitas } from "../../types";
import ComercialesRow from "./ComercialesRow";
import "../../styles/components/Comerciales/ComercialesTable.css";

interface ComercialesTableProps {
  comerciales: UserVisitas[];
  zonas: Zona[];
  isLoading: boolean;
  error: string | null;
  selectedComercialIds: Set<number>;
  expandedComercialId: number | null;
  toggleSelectComercial: (
    id: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  toggleComercialVisitas: (id: number) => void;
}

const ComercialesTable = ({
  comerciales,
  zonas,
  isLoading,
  error,
  selectedComercialIds,
  expandedComercialId,
  toggleSelectComercial,
  toggleComercialVisitas,
}: ComercialesTableProps) => {
  return (
    <section className="comerciales-table-section">
      {!isLoading && !error && comerciales.length > 0 && (
        <div className="comerciales-page-container">
          <table className="comerciales-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>Seleccionar</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Zona</th>
                <th>Visitas</th>
              </tr>
            </thead>
            <tbody>
              {comerciales.map((comercialItem) => (
                <ComercialesRow
                  key={comercialItem.id}
                  comercial={comercialItem}
                  isExpanded={expandedComercialId === comercialItem.id}
                  zonaNombre={
                    zonas.find((zona) => zona.id === comercialItem.id_zona)
                      ?.nombre || ""
                  }
                  isSelected={selectedComercialIds.has(comercialItem.id)}
                  onToggleSelect={(edificio) => {
                    edificio.stopPropagation();
                    toggleSelectComercial(comercialItem.id, edificio);
                  }}
                  onToggleExpand={() =>
                    toggleComercialVisitas(comercialItem.id)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ComercialesTable;
