import { useMapBoundsRestrictions } from "../../hooks/useMapBoundsRestrictions";
import type { GeoPoint } from "../../types/shared/GeoPoint";

interface MapViewProps {
  /**
   * Rol del usuario: "admin" o "comercial"
   */
  userRole?: string;

  /**
   * Puntos del polígono de la zona
   */
  zoneArea?: GeoPoint[] | null;

  /**
   * Padding en píxeles alrededor de los bordes
   * Default: 50px
   */
  paddingPixels?: number;

  /**
   * Factor de expansión del área de navegación
   * Default: 1.2 (20% más allá del polígono)
   */
  expansionFactor?: number;
}

/**
 * Componente que configura la vista y restricciones del mapa
 * Debe colocarse dentro de MapContainer
 *
 * Responsabilidades:
 * - Aplicar restricciones de navegación según el rol
 * - Configurar encuadre inicial con padding
 * - Aplicar límites de movimiento (maxBounds)
 *
 * Ejemplo de uso:
 * <MapContainer ...>
 *   <MapView userRole="comercial" zoneArea={zone.area} />
 *   <TileLayer ... />
 * </MapContainer>
 */
const MapView = ({
  userRole = "admin",
  zoneArea = null,
  paddingPixels = 50,
  expansionFactor = 1.2,
}: MapViewProps) => {
  // El hook configura automáticamente las restricciones y vista del mapa
  useMapBoundsRestrictions({
    userRole,
    zoneArea,
    paddingPixels,
    expansionFactor,
  });

  // Este componente no renderiza nada visual
  // Solo configura la lógica del mapa a través del hook
  return null;
};

export default MapView;
