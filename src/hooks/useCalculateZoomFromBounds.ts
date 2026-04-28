import { useEffect } from "react";
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

  useEffect(() => {
    if (!zoneArea || zoneArea.length === 0) return;

    try {
      // Convertir puntos GeoPoint a formato Leaflet
      const polygonPoints = zoneArea.map((p) => [p.lat, p.lng] as [number, number]);

      // Crear bounds del polígono
      const bounds = L.latLngBounds(polygonPoints);

      // Calcular automáticamente el zoom mínimo requerido para ver todo el polígono
      const minZoom = map.getBoundsZoom(bounds, false);

      // Zoom inicial ligeramente más cercano (1 nivel más)
      const initialZoom = Math.min(minZoom + 1, 16);

      // Llamar callback si está proporcionado
      if (onZoomCalculated) {
        onZoomCalculated({ minZoom, initialZoom });
      }

      // Aplicar configuración al mapa
      map.setMinZoom(minZoom);
      map.setMaxZoom(18);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });

      
    } catch (error) {
      console.error("Error al calcular zoom desde bounds:", error);
    }
  }, [zoneArea, map, onZoomCalculated]);
};
