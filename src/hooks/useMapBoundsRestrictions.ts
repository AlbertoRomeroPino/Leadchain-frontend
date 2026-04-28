import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoPoint } from "../types";

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
 * Calcular los bounds del polígono en una sola pasada (O(n))
 * evitando múltiples Math.min/max
 */
const calculatePolygonBounds = (zoneArea: GeoPoint[]) => {
  if (zoneArea.length === 0) throw new Error("zoneArea cannot be empty");

  const initial = zoneArea[0];
  const bounds = {
    minLat: initial.lat,
    maxLat: initial.lat,
    minLng: initial.lng,
    maxLng: initial.lng,
  };

  for (let i = 1; i < zoneArea.length; i++) {
    const point = zoneArea[i];
    bounds.minLat = Math.min(bounds.minLat, point.lat);
    bounds.maxLat = Math.max(bounds.maxLat, point.lat);
    bounds.minLng = Math.min(bounds.minLng, point.lng);
    bounds.maxLng = Math.max(bounds.maxLng, point.lng);
  }

  return bounds;
};

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
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Admin: sin restricciones
    if (userRole !== "comercial" || !zoneArea || zoneArea.length === 0) {
      map.setMaxBounds(undefined);
      return;
    }

    try {
      // === PASO 1: Calcular bounds del polígono ===
      const { minLat, maxLat, minLng, maxLng } = calculatePolygonBounds(zoneArea);
      const polygonBounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);

      // === PASO 2: ENCUADRE INICIAL con padding ===
      map.fitBounds(polygonBounds, {
        padding: [paddingPixels, paddingPixels],
        animate: true,
        duration: 1.5,
      });

      // === PASO 3: Calcular bounds expandidos para maxBounds ===
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;

      const latExpansion = (latDiff * (expansionFactor - 1)) / 2;
      const lngExpansion = (lngDiff * (expansionFactor - 1)) / 2;

      const expandedBounds = L.latLngBounds(
        [minLat - latExpansion, minLng - lngExpansion],
        [maxLat + latExpansion, maxLng + lngExpansion]
      );

      map.setMaxBounds(expandedBounds);

      // === PASO 4: Asegurar que el mapa siempre está dentro de los límites ===
      // Usar debounce para evitar múltiples cálculos
      const ensureInBounds = () => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
          if (!map.getBounds().intersects(expandedBounds)) {
            map.panInsideBounds(expandedBounds, { animate: true });
          }
        }, 200);
      };

      map.on("moveend", ensureInBounds);
      map.on("zoomend", ensureInBounds);

      // Cleanup: desmontar listeners y limpiar timeout
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        map.off("moveend", ensureInBounds);
        map.off("zoomend", ensureInBounds);
      };
    } catch (error) {
      console.error("Error al aplicar restricciones de mapa:", error);
    }
  }, [userRole, zoneArea, map, paddingPixels, expansionFactor]);
};
