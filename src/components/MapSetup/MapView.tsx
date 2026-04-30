import { memo } from "react";
import { useMapBoundsRestrictions } from "../../hooks/useMapBoundsRestrictions";
import type { GeoPoint } from "../../types";

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
 * Componente memoizado que configura la vista y restricciones del mapa
 * Debe colocarse dentro de MapContainer
 */
const MapView = memo(({
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
  return null;
});

// Ayuda a las herramientas de desarrollo de React a identificar el componente
MapView.displayName = "MapView";

export default MapView;