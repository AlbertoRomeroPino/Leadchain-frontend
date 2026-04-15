import type { Cliente } from "../../../types/clientes/Cliente";
import "../../../styles/components/Clientes/Info/InfoClienteDatosCard.css";

interface InfoClienteDatosCardProps {
  cliente: Cliente;
}

const InfoClienteDatosCard = ({ cliente }: InfoClienteDatosCardProps) => {
  return (
    <article className="info-cliente-card">
      <h1 className="info-cliente-title">
        {cliente.nombre + " " + cliente.apellidos}
      </h1>
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
