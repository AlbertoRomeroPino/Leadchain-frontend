import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoPoint } from "../types";

interface UseMapBoundsRestrictionsProps {
  userRole?: string;
  zoneArea?: GeoPoint[] | null;
  paddingPixels?: number;
  expansionFactor?: number;
}

export const useMapBoundsRestrictions = ({
  userRole = "admin",
  zoneArea = null,
  paddingPixels = 50,
  expansionFactor = 1.2,
}: UseMapBoundsRestrictionsProps) => {
  const map = useMap();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (userRole !== "comercial" || !zoneArea || zoneArea.length === 0) {
      map.setMaxBounds(null as unknown as L.LatLngBoundsExpression);
      return;
    }

    try {
      // OPTIMIZACIÓN: Delegamos los cálculos geométricos a Leaflet
      const polygonBounds = L.latLngBounds(zoneArea as L.LatLngExpression[]);

      map.fitBounds(polygonBounds, {
        padding: [paddingPixels, paddingPixels],
        animate: true,
        duration: 1.5,
      });

      // Expansión nativa
      const paddingRatio = (expansionFactor - 1) / 2;
      const expandedBounds = polygonBounds.pad(paddingRatio);

      map.setMaxBounds(expandedBounds);

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

      return () => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        map.off("moveend", ensureInBounds);
        map.off("zoomend", ensureInBounds);
      };
    } catch (error) {
      console.error("Error al aplicar restricciones de mapa:", error);
    }
  }, [userRole, zoneArea, map, paddingPixels, expansionFactor]);
};
