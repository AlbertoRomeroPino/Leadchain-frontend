import type { Edificio } from "../../types/edificios/Edificio";



interface EdificioTablaProps {
  edificios: Edificio[];
  onEdificioSelect?: (edificio: Edificio) => void;
}

const EdificioTabla = ({ edificios, onEdificioSelect }: EdificioTablaProps) => {
  return (
    <div className="edificios-container">
      <table className="edificios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dirección</th>
            <th>Zona</th>
            <th>Tipo</th>
            {edificios.some((e) => e.planta || e.puerta) && (
              <>
                <th>Planta</th>
                <th>Puerta</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {edificios.length > 0 ? (
            edificios.map((edificio) => (
              <tr
                key={edificio.id}
                className="edificio-table-row"
                onClick={() => onEdificioSelect?.(edificio)}
              >
                <td className="edificio-cell edificio-cell-id">{edificio.id}</td>
                <td className="edificio-cell edificio-cell-direccion">{edificio.direccion_completa}</td>
                <td className="edificio-cell edificio-cell-zona">{edificio.id_zona}</td>
                <td className="edificio-cell edificio-cell-tipo">{edificio.tipo}</td>
                {edificios.some((e) => e.planta || e.puerta) && (
                  <>
                    <td className="edificio-cell edificio-cell-planta">{edificio.planta || "-"}</td>
                    <td className="edificio-cell edificio-cell-puerta">{edificio.puerta || "-"}</td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="clientes-empty-row">
                No hay edificios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EdificioTabla;
