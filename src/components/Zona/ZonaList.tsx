import type { Zona } from "../../types/zonas/Zona";
import "../../styles/components/Zona/ZonaList.css";

interface ZonaListProps {
  zonas: Zona[];
  selectedZonaId: number | null;
  edificiosPorZona: Record<number, number>;
  onSelectZona: (zona: Zona) => void;
}

const ZonaList = ({ zonas, selectedZonaId, edificiosPorZona, onSelectZona }: ZonaListProps) => (
  <div className="zona-container">
    <table className="zona-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre de la Zona</th>
          <th>Total Edificios</th>
        </tr>
      </thead>
      <tbody>
        {zonas.map((zona) => (
          <tr
            key={zona.id}
            onClick={() => onSelectZona(zona)}
            className={selectedZonaId === zona.id ? "selected" : ""}
          >
            <td>{zona.id}</td>
            <td>{zona.nombre}</td>
            <td>{edificiosPorZona[zona.id] || 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ZonaList;
