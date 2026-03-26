import type { Edificio } from "../../types/edificios/Edificio";

interface EdificioTablaProps {
  edificios: Edificio[];
  onEdificioSelect?: (edificio: Edificio) => void;
}

const EdificioTabla = ({ edificios, onEdificioSelect }: EdificioTablaProps) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dirección</th>
            <th>Planta</th>
            <th>Puerta</th>
            {/* Se pone la zona Nombre porque no se puede poner ubicación */}
            <th>Zona</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {edificios.map((edificio) => (
            <tr key={edificio.id} onClick={() => onEdificioSelect?.(edificio)}>
              <td>{edificio.id}</td>
              <td>{edificio.direccion_completa}</td>
              <td>{edificio.planta}</td>
              <td>{edificio.puerta}</td>
              {/* TODO: Reemplazar por el nombre de la zona */}
              <td>{edificio.id_zona}</td>
              <td>{edificio.tipo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EdificioTabla;
