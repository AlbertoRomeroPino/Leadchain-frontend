import type { Edificio } from "../../../types/edificios/Edificio";
import type { Zona } from "../../../types/zonas/Zona";
import "../../../styles/components/Clientes/Info/InfoClienteEdificioCard.css";

interface InfoClienteEdificioCardProps {
  edificio: Edificio | null;
  zona: Zona | null;
}

const InfoClienteEdificioCard = ({
  edificio,
  zona,
}: InfoClienteEdificioCardProps) => {
  return (
    <article className="info-cliente-card">
      <h2 className="info-cliente-subtitle">Edificio</h2>
      <p className="info-cliente-address">
        {edificio?.direccion_completa ?? "Sin Asignar"}
      </p>
      <div className="info-cliente-grid">
        <p className="info-cliente-line">
          <strong>Tipo:</strong> {edificio?.tipo ?? "-"}
        </p>
        <p className="info-cliente-line">
          <strong>Zona:</strong> {zona?.nombre ?? "-"}
        </p>
        <p className="info-cliente-line">
          <strong>Planta:</strong> {edificio?.planta ?? "-"}
        </p>
        <p className="info-cliente-line">
          <strong>Puerta:</strong> {edificio?.puerta ?? "-"}
        </p>
      </div>
    </article>
  );
};

export default InfoClienteEdificioCard;
