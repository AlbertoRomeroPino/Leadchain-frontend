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

const CommercialMapView = ({ userRole, userZonaId }: CommercialMapViewProps) => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [calculatedZoom, setCalculatedZoom] = useState<{ minZoom: number; initialZoom: number } | null>(null);

  useInitialize(async () => {
    try {
      showLoadingAlert("Cargando mapa...");

      // Cargar datos del mapa
      const mapData = await InicioService.getMapaInicio();
      setZonas(mapData.zonas);

      // Extraer solo los edificios de la zona del comercial
      const edificiosZona: Edificio[] = [];
      mapData.zonas.forEach((zona) => {
        if (zona.id === userZonaId && zona.edificios && Array.isArray(zona.edificios)) {
          zona.edificios.forEach((edificio) => {
            edificiosZona.push(edificio as Edificio);
          });
        }
      });

      setEdificios(edificiosZona);

      showSuccessAlert("Información cargada");
    } catch (err) {
      showErrorAlert(err, "Cargar Mapa");
      console.error("Error al cargar datos:", err);
    }
  });

  // Calcular configuración de mapa basada en el área (polygon) de la zona del comercial
  const { centerCoords, zoomLevel, maxBounds } = useMemo(() => {
    // Validar que tenemos una zona ID y que haya zonas cargadas
    if (!userZonaId || !zonas || zonas.length === 0) {
      return {
        centerCoords: [37.8847, -4.7792] as [number, number],
        zoomLevel: 13,
        maxBounds: [[37.75, -5.02], [37.99, -4.62]] as LatLngBoundsExpression,
        minZoomLevel: 11,
      };
    }

    // Buscar la zona del comercial
    const userZona = zonas.find((zona) => zona.id === userZonaId);

    // Validar que existe la zona y tiene área (polygon)
    if (!userZona) {
      console.warn(`Zona con ID ${userZonaId} no encontrada`);
      return {
        centerCoords: [37.8847, -4.7792] as [number, number],
        zoomLevel: 13,
        maxBounds: [[37.75, -5.02], [37.99, -4.62]] as LatLngBoundsExpression,
      };
    }

    if (!userZona.area || userZona.area.length === 0) {
      console.warn(`Zona ${userZonaId} no tiene área definida`);
      return {
        centerCoords: [37.8847, -4.7792] as [number, number],
        zoomLevel: 13,
        maxBounds: [[37.75, -5.02], [37.99, -4.62]] as LatLngBoundsExpression,
      };
    }

    // Calcular bounds del área (polygon)
    const lats = userZona.area.map((p) => p.lat);
    const lngs = userZona.area.map((p) => p.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Centro del polígono
    const centerLat = (maxLat + minLat) / 2;
    const centerLng = (maxLng + minLng) / 2;

    // Buffer para visualización (~1.5 km en Córdoba)
    const buffer = 0.015;

    // Crear bounds con buffer
    const boundsWithBuffer: LatLngBoundsExpression = [
      [minLat - buffer, minLng - buffer],
      [maxLat + buffer, maxLng + buffer],
    ];

    return {
      centerCoords: [centerLat, centerLng] as [number, number],
      zoomLevel: calculatedZoom?.initialZoom ?? 13,
      maxBounds: boundsWithBuffer,
    };
  }, [userZonaId, zonas, calculatedZoom]);

  return (
    <GlovalMap
      zonas={zonas}
      edificios={edificios}
      userRole={userRole}
      userZonaId={userZonaId}
      centerCoords={centerCoords}
      zoomLevel={zoomLevel}
      customMaxBounds={maxBounds}
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