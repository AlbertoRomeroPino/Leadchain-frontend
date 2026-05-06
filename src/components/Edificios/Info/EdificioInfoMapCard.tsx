import { memo, useMemo } from 'react';
import type { Edificio, Zona } from '../../../types';
import GlobalMap from '../../utils/GlobalMap'; // Ajusta la ruta si es diferente

import '../../../styles/components/Edificios/Info/EdificioInfoMapCard.css';

interface EdificioInfoMapCardProps {
  edificio: Edificio;
  zona?: Zona | null;
  userRole?: string;
}

const EdificioInfoMapCard = memo(({ 
  edificio, 
  zona, 
  userRole = 'admin' 
}: EdificioInfoMapCardProps) => {
  
  // OPTIMIZACIÓN: Memoizamos los arrays para que GlobalMap no sufra 
  // re-renderizados por culpa de nuevas referencias en memoria.
  const edificiosArray = useMemo(() => [edificio], [edificio]);
  const zonasArray = useMemo(() => (zona ? [zona] : []), [zona]);

  const hasZonaArea = !!zona?.area && zona.area.length > 0;

  return (
    <div className="edificio-card edificio-map-card" style={{ position: 'relative' }}>
      <h2 className="edificio-map-title">Mapa del edificio</h2>
      
      {/* Contenedor para darle la altura correcta a GlobalMap */}
      <div className="edificio-map-wrapper" style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <GlobalMap
          edificios={edificiosArray}
          zonas={zonasArray}
          userRole={userRole}
          showTitle={false}
        />
      </div>
      
      {hasZonaArea && (
        <p style={{ color: '#94a3b8', margin: '8px 0 0' }}>
          Límite de zona mostrado en azul.
        </p>
      )}
      {!edificio.ubicacion && (
        <p style={{ color: '#94a3b8', margin: '8px 0 0' }}>
          No hay ubicación disponible para este edificio.
        </p>
      )}
    </div>
  );
});

EdificioInfoMapCard.displayName = 'EdificioInfoMapCard';

export default EdificioInfoMapCard;