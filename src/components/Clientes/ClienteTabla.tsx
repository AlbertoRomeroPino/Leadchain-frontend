import type { Cliente } from "../../types/clientes/Cliente";
import "../../styles/components/Clientes/ClienteTabla.css";

interface ClienteProps {
  cliente: Cliente;
  onSelect: (cliente: Cliente) => void;
}

const nombreCapado = (cliente: Cliente) => {
  // si el nombre del cliente tiene mas de 15 caracteres, se capa a 15 caracteres y se añade "..." al final
  if (cliente.nombre.length > 15) {
    return cliente.nombre.slice(0, 15) + "...";
  }

  return cliente.nombre;
};
const apellidosCapados = (cliente: Cliente) => {
  if (cliente.apellidos.length > 25) {
    return cliente.apellidos.slice(0, 25) + "...";
  }
  return cliente.apellidos;
};

const TablaCliente = ({ cliente, onSelect }: ClienteProps) => {
  return (
    <tr onClick={() => onSelect(cliente)} style={{ cursor: "pointer" }}>
      <td>{cliente.id}</td>
      <td>{nombreCapado(cliente)}</td>
      <td>{apellidosCapados(cliente)}</td>
      <td>{cliente.telefono ?? "–"}</td>
      <td>{cliente.email ?? "–"}</td>
    </tr>
  );
};

export default TablaCliente;
