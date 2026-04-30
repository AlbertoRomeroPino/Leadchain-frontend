import "../../../styles/components/Edificios/Info/EdificioInfoClienteCard.css";
import type { Cliente } from "../../../types";

interface EdificioInfoClienteInfoProps {
  cliente: Cliente;
  planta?: string;
  puerta?: string;
}

const EdificioInfoClienteInfo = ({
  cliente,
  planta,
  puerta,
}: EdificioInfoClienteInfoProps) => {
  const nombreCompleto = () => {
    // si el nombre y apellidos del cliente es de mas de 40 caracteres en total, se capa a 40 caracteres y se añade "..." al final
    const nombreCompleto = `${cliente.nombre} ${cliente.apellidos}`.trim();
    if (nombreCompleto.length > 40) {
      return nombreCompleto.slice(0, 40) + "...";
    }

    return nombreCompleto;
  };
  return (
    <div className="cliente-detail">
      <div className="cliente-nombre">{nombreCompleto()}</div>
      <div className="cliente-meta">
        Piso: {planta ?? "-"} • Puerta: {puerta ?? "-"}
      </div>
      <div className="cliente-contacto">
        <div>Tel: {cliente.telefono ?? "N/A"} </div>
        <div>Email: {cliente.email ?? "N/A"}</div>
      </div>
    </div>
  );
};

export default EdificioInfoClienteInfo;
