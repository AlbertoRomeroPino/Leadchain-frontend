import type { Cliente } from "../../types/clientes/Cliente";
import TablaCliente from "./TablaCliente";

interface ClientesConEdificioTableProps {
  clientes: Cliente[];
  onSelectCliente: (cliente: Cliente) => void;
}

const ClientesConEdificioTable = ({
  clientes,
  onSelectCliente,
}: ClientesConEdificioTableProps) => {
  return (
    <div className="clientes-container">
      <table className="clientes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Teléfono</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <TablaCliente
              key={cliente.id}
              cliente={cliente}
              onSelect={onSelectCliente}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesConEdificioTable;
