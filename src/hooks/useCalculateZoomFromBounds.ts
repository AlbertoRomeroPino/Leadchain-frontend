import { useEffect, useMemo, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoPoint } from "../types";

interface UseCalculateZoomFromBoundsProps {
  /**
   * Puntos del polígono de la zona
   */
  zoneArea?: GeoPoint[] | null;

  /**
   * Callback cuando el zoom es calculado
   */
  onZoomCalculated?: (zoom: { minZoom: number; initialZoom: number }) => void;
}

/**
 * Hook que calcula automáticamente el zoom mínimo y inicial basado en los bounds de una zona
 * Utiliza Leaflet's getBoundsZoom() para precisión
 */
export const useCalculateZoomFromBounds = ({
  zoneArea = null,
  onZoomCalculated,
}: UseCalculateZoomFromBoundsProps) => {
  const map = useMap();

  // Convertir puntos GeoPoint a formato Leaflet [lat, lng] solo cuando zoneArea cambia
  const polygonBounds = useMemo(() => {
    if (!zoneArea || zoneArea.length === 0) return null;

    try {
      const polygonPoints = zoneArea.map((p) => [p.lat, p.lng] as [number, number]);
      return L.latLngBounds(polygonPoints);
    } catch (error) {
      console.error("Error al crear bounds del polígono:", error);
      return null;
    }
  }, [zoneArea]);

  // Memoizar el callback para evitar re-renders innecesarios
  const handleZoomCalculated = useCallback(
    (minZoom: number, initialZoom: number) => {
      onZoomCalculated?.({ minZoom, initialZoom });
    },
    [onZoomCalculated]
  );

  useEffect(() => {
    if (!polygonBounds) return;

    try {
      // Calcular zoom mínimo requerido para ver todo el polígono
      const minZoom = map.getBoundsZoom(polygonBounds, false);

      // Zoom inicial ligeramente más cercano (1 nivel más)
      const initialZoom = Math.min(minZoom + 1, 16);

      // Notificar cambio de zoom
      handleZoomCalculated(minZoom, initialZoom);

      // Aplicar configuración al mapa
      map.setMinZoom(minZoom);
      map.setMaxZoom(18);
      map.fitBounds(polygonBounds, { padding: [50, 50], animate: true });
    } catch (error) {
      console.error("Error al calcular zoom desde bounds:", error);
    }
  }, [polygonBounds, map, handleZoomCalculated]);
};
