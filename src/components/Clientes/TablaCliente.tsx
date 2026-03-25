import type { Cliente } from "../../types/clientes/Cliente";

interface ClienteProps {
  cliente: Cliente;
  onSelect: (cliente: Cliente) => void;
}

const TablaCliente = ({ cliente, onSelect }: ClienteProps) => {
  return (
    <tr onClick={() => onSelect(cliente)} style={{ cursor: "pointer" }}>
      <td>{cliente.id}</td>
      <td>{cliente.nombre}</td>
      <td>{cliente.apellidos}</td>
      <td>{cliente.telefono ?? "–"}</td>
      <td>{cliente.email ?? "–"}</td>
    </tr>
  );
};

export default TablaCliente;
