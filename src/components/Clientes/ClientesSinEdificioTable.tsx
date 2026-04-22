import type { Cliente } from "../../types/clientes/Cliente";
import ClienteTabla from "./ClienteTabla";
import "../../styles/components/Clientes/ClientesSinEdificioTable.css";

interface ClientesSinEdificioTableProps {
  isAdmin: boolean;
  clientesSinEdificio: Cliente[];
  onSelectCliente: (cliente: Cliente) => void;
}

const ClientesSinEdificioTable = ({
  isAdmin,
  clientesSinEdificio,
  onSelectCliente,
}: ClientesSinEdificioTableProps) => {
  if (!isAdmin) {
    return null;
  }

  

  return (
    <div className="clientes-secondary-section">
      <h2 className="clientes-secondary-title">Clientes sin edificio</h2>
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
            {clientesSinEdificio.length === 0 ? (
              <tr>
                <td colSpan={5} className="clientes-empty-row">
                  No hay clientes sin edificio
                </td>
              </tr>
            ) : (
              clientesSinEdificio.map((cliente) => (
                <ClienteTabla
                  key={`sin-edificio-${cliente.id}`}
                  cliente={cliente}
                  onSelect={onSelectCliente}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientesSinEdificioTable;
