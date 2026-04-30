import { useEffect, useMemo, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoPoint } from "../types";

interface UseCalculateZoomFromBoundsProps {
  zoneArea?: GeoPoint[] | null;
  onZoomCalculated?: (zoom: { minZoom: number; initialZoom: number }) => void;
}

export const useCalculateZoomFromBounds = ({
  zoneArea = null,
  onZoomCalculated,
}: UseCalculateZoomFromBoundsProps) => {
  const map = useMap();

  const polygonBounds = useMemo(() => {
    if (!zoneArea || zoneArea.length === 0) return null;

    try {
      // OPTIMIZACIÓN: Cast directo sin crear arrays nuevos en memoria
      return L.latLngBounds(zoneArea as L.LatLngExpression[]);
    } catch (error) {
      console.error("Error al crear bounds del polígono:", error);
      return null;
    }
  }, [zoneArea]);

  const handleZoomCalculated = useCallback(
    (minZoom: number, initialZoom: number) => {
      onZoomCalculated?.({ minZoom, initialZoom });
    },
    [onZoomCalculated]
  );

  useEffect(() => {
    if (!polygonBounds) return;

    try {
      const minZoom = map.getBoundsZoom(polygonBounds, false);
      const initialZoom = Math.min(minZoom + 1, 16);

      handleZoomCalculated(minZoom, initialZoom);

      map.setMinZoom(minZoom);
      map.setMaxZoom(18);
      
      // OPTIMIZACIÓN: Evitar que la animación congele el renderizado principal
      requestAnimationFrame(() => {
        map.fitBounds(polygonBounds, { padding: [50, 50], animate: true });
      });
    } catch (error) {
      console.error("Error al calcular zoom desde bounds:", error);
    }
  }, [polygonBounds, map, handleZoomCalculated]);
};