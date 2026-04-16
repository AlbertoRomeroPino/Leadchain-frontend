import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoPoint } from "../types/shared/GeoPoint";

interface UseMapBoundsRestrictionsProps {
  /**
   * Rol del usuario: "admin" (sin restricciones) o "comercial" (con restricciones)
   */
  userRole?: string;

  /**
   * Puntos del polígono de la zona (coordenadas del área)
   */
  zoneArea?: GeoPoint[] | null;

  /**
   * Padding en píxeles alrededor de los bordes del polígono
   * Default: 50px
   */
  paddingPixels?: number;

  /**
   * Factor de expansión del área para permitir navegación fuera
   * Default: 1.2 (20% más allá del polígono)
   */
  expansionFactor?: number;
}

/**
 * Hook que configura restricciones de navegación y zoom según el rol del usuario
 *
 * Admin: Comportamiento libre, sin restricciones
 * Comercial: Encuadre inicial con padding + restricción de movimiento (maxBounds)
 */
export const useMapBoundsRestrictions = ({
  userRole = "admin",
  zoneArea = null,
  paddingPixels = 50,
  expansionFactor = 1.2,
}: UseMapBoundsRestrictionsProps) => {
  const map = useMap();

  useEffect(() => {
    // Admin: sin restricciones
    if (userRole !== "comercial" || !zoneArea || zoneArea.length === 0) {
      // Restablecer configuración libre
      map.setMaxBounds(undefined);
      return;
    }

    // COMERCIAL: Aplicar restricciones
    try {
      // 1. Calcular bounds del polígono
      const lats = zoneArea.map((p) => p.lat);
      const lngs = zoneArea.map((p) => p.lng);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const polygonBounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);

      // 2. ENCUADRE INICIAL: fitBounds con padding
      map.fitBounds(polygonBounds, {
        padding: [paddingPixels, paddingPixels],
        animate: true,
        duration: 1.5,
      });

      // 3. RESTRICCIÓN DE MOVIMIENTO: Expandir bounds para maxBounds
      // Calcular distancias
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;

      // Expandir según el factor (ej: 1.2 = 20% más allá)
      const latExpansion = latDiff * (expansionFactor - 1) / 2;
      const lngExpansion = lngDiff * (expansionFactor - 1) / 2;

      const expandedBounds = L.latLngBounds(
        [minLat - latExpansion, minLng - lngExpansion],
        [maxLat + latExpansion, maxLng + lngExpansion]
      );

      // Configurar maxBounds
      map.setMaxBounds(expandedBounds);

      // 4. Event listener para asegurar que siempre está dentro de los límites
      const ensureInBounds = () => {
        if (!map.getBounds().intersects(expandedBounds)) {
          map.panInsideBounds(expandedBounds, { animate: true });
        }
      };

      map.on("moveend", ensureInBounds);
      map.on("zoomend", ensureInBounds);

      

      // Cleanup
      return () => {
        map.off("moveend", ensureInBounds);
        map.off("zoomend", ensureInBounds);
      };
    } catch (error) {
      console.error("Error al aplicar restricciones de mapa:", error);
    }
  }, [userRole, zoneArea, map, paddingPixels, expansionFactor]);
};
