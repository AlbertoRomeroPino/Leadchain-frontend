import { memo } from 'react';
import type { Edificio } from '../../../types';

import '../../../styles/components/Edificios/Info/EdificioInfoDetailsCard.css';

interface EdificioInfoDetailsCardProps {
  edificio: Edificio;
  zona?: { nombre?: string } | null;
}

// OPTIMIZACIÓN: Envolvemos en memo() para evitar re-renderizados 
// si las props (edificio y zona) no han cambiado.
const EdificioInfoDetailsCard = memo(({
  edificio,
  zona
}: EdificioInfoDetailsCardProps) => {
  
  // OPTIMIZACIÓN 2 (Legibilidad): Desestructuramos el edificio para limpiar el JSX 
  // y evitar leer el objeto repetidas veces.
  const { direccion_completa, tipo, id_zona, ubicacion } = edificio;

  return (
    <div className="edificio-card edificio-details-card">
      <h2 className="edificio-details-title">Datos del edificio</h2>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Dirección:</strong> {direccion_completa}
      </p>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Tipo:</strong> {tipo}
      </p>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Zona:</strong> {zona?.nombre ?? id_zona}
      </p>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Lat:</strong> {ubicacion?.lat ?? '-'}
      </p>
      <p className="edificio-details-row">
        <strong className="edificio-details-label">Lng:</strong> {ubicacion?.lng ?? '-'}
      </p>
    </div>
  );
});

// Ayuda a las DevTools de React a mostrar el nombre real del componente
EdificioInfoDetailsCard.displayName = 'EdificioInfoDetailsCard';

export default EdificioInfoDetailsCard;