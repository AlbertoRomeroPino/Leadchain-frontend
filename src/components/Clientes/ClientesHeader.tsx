import { UserPlus2 } from "lucide-react";
import "../../styles/components/Clientes/ClientesHeader.css";

interface ClientesHeaderProps {
  canCreateCliente: boolean;
  onCreateClick: () => void;
}

const ClientesHeader = ({
  canCreateCliente,
  onCreateClick,
}: ClientesHeaderProps) => {
  return (
    <div className="clientes-header">
      <h1 className="clientes-title">Clientes</h1>
      {canCreateCliente && (
        <button className="clientes-create-button" onClick={onCreateClick}>
          <UserPlus2 size={16} />
          Crear cliente
        </button>
      )}
    </div>
  );
};

export default ClientesHeader;
