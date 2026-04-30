import { useState, useMemo } from "react";
import GlovalMap from "../utils/GlovalMap";
import { InicioService } from "../../services/InicioService";
import { useInitialize } from "../../hooks/useInitialize";
import { showLoadingAlert, showErrorAlert, showSuccessAlert } from "../utils/errorHandler";
import type { Zona, Edificio } from "../../types";
import type { LatLngBoundsExpression } from "leaflet";

interface CommercialMapViewProps {
  userRole?: string;
  userZonaId?: number;
}

// 1. Extraemos la configuración por defecto fuera del componente
// Esto evita recrear el objeto en cada renderizado
const DEFAULT_MAP_CONFIG = {
  centerCoords: [37.8847, -4.7792] as [number, number],
  zoomLevel: 13,
  maxBounds: [[37.75, -5.02], [37.99, -4.62]] as LatLngBoundsExpression,
};

const CommercialMapView = ({ userRole, userZonaId }: CommercialMapViewProps) => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [calculatedZoom, setCalculatedZoom] = useState<{ minZoom: number; initialZoom: number } | null>(null);

  useInitialize(async () => {
    try {
      showLoadingAlert("Cargando mapa...");

      const mapData = await InicioService.getMapaInicio();
      setZonas(mapData.zonas);

      // 2. Optimización O(1) vs O(n^2): En lugar de iterar TODAS las zonas, 
      // buscamos directamente la del comercial.
      const userZona = mapData.zonas.find((zona) => zona.id === userZonaId);
      
      if (userZona?.edificios && Array.isArray(userZona.edificios)) {
        setEdificios(userZona.edificios as Edificio[]);
      }

      showSuccessAlert("Información cargada");
    } catch (err) {
      showErrorAlert(err, "Cargar Mapa");
      console.error("Error al cargar datos:", err);
    }
  });

  // 3. Calculamos la configuración espacial
  const spatialConfig = useMemo(() => {
    if (!userZonaId || !zonas || zonas.length === 0) return DEFAULT_MAP_CONFIG;

    const userZona = zonas.find((zona) => zona.id === userZonaId);
    if (!userZona?.area?.length) return DEFAULT_MAP_CONFIG;

    // 4. Optimización de memoria y CPU: Un solo recorrido (reduce)
    // Evitamos hacer .map() dos veces y usar el operador spread (...)
    const bounds = userZona.area.reduce(
      (acc, p) => ({
        minLat: Math.min(acc.minLat, p.lat),
        maxLat: Math.max(acc.maxLat, p.lat),
        minLng: Math.min(acc.minLng, p.lng),
        maxLng: Math.max(acc.maxLng, p.lng),
      }),
      { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
    );

    const centerLat = (bounds.maxLat + bounds.minLat) / 2;
    const centerLng = (bounds.maxLng + bounds.minLng) / 2;
    const buffer = 0.015;

    return {
      centerCoords: [centerLat, centerLng] as [number, number],
      maxBounds: [
        [bounds.minLat - buffer, bounds.minLng - buffer],
        [bounds.maxLat + buffer, bounds.maxLng + buffer],
      ] as LatLngBoundsExpression,
    };
  }, [userZonaId, zonas]); // 5. Eliminamos `calculatedZoom` de las dependencias

  // 6. Derivamos el zoom fuera del useMemo para evitar recalcular polígonos
  const currentZoomLevel = calculatedZoom?.initialZoom ?? DEFAULT_MAP_CONFIG.zoomLevel;

  return (
    <GlovalMap
      zonas={zonas}
      edificios={edificios}
      userRole={userRole}
      userZonaId={userZonaId}
      centerCoords={spatialConfig.centerCoords}
      zoomLevel={currentZoomLevel}
      customMaxBounds={spatialConfig.maxBounds}
      title="Mapa de tu Zona"
      enableMapBoundsSetup={true}
      mapPaddingPixels={50}
      mapExpansionFactor={1.2}
      enableZoomCalculator={true}
      onZoomCalculated={setCalculatedZoom}
    />
  );
};

export default CommercialMapView;