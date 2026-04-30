import type { Cliente } from "../../../types";
import "../../../styles/components/Clientes/Info/InfoClienteDatosCard.css";

interface InfoClienteDatosCardProps {
  cliente: Cliente;
}

const InfoClienteDatosCard = ({ cliente }: InfoClienteDatosCardProps) => {
  const nombreCompleto = () => {
    // si el nombre y apellidos del cliente es de mas de 40 caracteres en total, se capa a 40 caracteres y se añade "..." al final
    const nombreCompleto = `${cliente.nombre} ${cliente.apellidos}`.trim();
    if (nombreCompleto.length > 40) {
      if (cliente.apellidos === "Sin apellidos") {
        return cliente.nombre.slice(0, 40) + "...";
      } else {
        return nombreCompleto.slice(0, 40) + "...";
      }
    } else {
      if (cliente.apellidos === "Sin apellidos") {
        return cliente.nombre;
      } else {
        return nombreCompleto;
      }
    }
  };

  return (
    <article className="info-cliente-card">
      <h1 className="info-cliente-title">{nombreCompleto()}</h1>
      <p className="info-cliente-line">
        <strong>Teléfono:</strong> {cliente.telefono ?? "No proporcionado"}
      </p>
      <p className="info-cliente-line">
        <strong>Email:</strong> {cliente.email ?? "No proporcionado"}
      </p>
    </article>
  );
};

export default InfoClienteDatosCard;
