import { useCalculateZoomFromBounds } from "../../hooks/useCalculateZoomFromBounds";
import type { GeoPoint } from "../../types/shared/GeoPoint";

interface ZoomCalculatorProps {
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
 * Componente que calcula y aplica automáticamente el zoom basado en los bounds de una zona
 * Debe estar dentro de un MapContainer
 */
const ZoomCalculator = ({ zoneArea, onZoomCalculated }: ZoomCalculatorProps) => {
  useCalculateZoomFromBounds({ zoneArea, onZoomCalculated });
  return null;
};

export default ZoomCalculator;
