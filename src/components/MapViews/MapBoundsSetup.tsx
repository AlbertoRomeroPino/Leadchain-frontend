import { useMapBoundsRestrictions } from "../../hooks/useMapBoundsRestrictions";
import type { GeoPoint } from "../../types/shared/GeoPoint";

interface MapBoundsSetupProps {
  /**
   * Rol del usuario
   */
  userRole?: string;

  /**
   * Puntos del polígono de la zona
   */
  zoneArea?: GeoPoint[] | null;

  /**
   * Padding en píxeles
   */
  paddingPixels?: number;

  /**
   * Factor de expansión
   */
  expansionFactor?: number;
}

/**
 * Componente que configura las restricciones de bounds del mapa
 * Debe colocarse dentro de MapContainer
 *
 * Props:
 * - userRole: "admin" o "comercial"
 * - zoneArea: Array de GeoPoint
 * - paddingPixels: Margen visual (default: 50)
 * - expansionFactor: Factor de expansión (default: 1.2)
 */
const MapBoundsSetup = ({
  userRole = "admin",
  zoneArea = null,
  paddingPixels = 50,
  expansionFactor = 1.2,
}: MapBoundsSetupProps) => {
  // El hook configura automáticamente el mapa
  useMapBoundsRestrictions({
    userRole,
    zoneArea,
    paddingPixels,
    expansionFactor,
  });

  // Este componente no renderiza nada visual
  return null;
};

export default MapBoundsSetup;
