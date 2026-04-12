import { useState, useMemo } from "react";
import GlovalMap from "../components/utils/GlovalMap";
import MapaEdificioPanel from "../components/MapaEdificioPanel";
import Sidebar from "../layout/Sidebar";
import "../styles/Map.css";
import { useAuth } from "../auth/useAuth";
import { InicioService } from "../services/InicioService";
import { useInitialize } from "../hooks/useInitialize";
import type { Zona } from "../types/zonas/Zona";
import type { Edificio } from "../types/edificios/Edificio";
import type { LatLngBoundsExpression } from "leaflet";

const MapPage = () => {
  const { user } = useAuth();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [selectedEdificio, setSelectedEdificio] = useState<Edificio | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useInitialize(async () => {
    try {
      setLoading(true);
      setError(null);
      // Una sola petición consolida zonas con edificios y clientes
      const mapData = await InicioService.getMapaInicio();
      setZonas(mapData.zonas);
      
      // Extraer todos los edificios de todas las zonas
      const todosEdificios: Edificio[] = [];
      mapData.zonas.forEach((zona) => {
        if (zona.edificios && Array.isArray(zona.edificios)) {
          zona.edificios.forEach((edificio) => {
            todosEdificios.push(edificio as Edificio);
          });
        }
      });
      setEdificios(todosEdificios);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  });

  // Calcular centro, zoom y maxBounds para la zona del comercial
  const { centerCoords, zoomLevel, maxBounds, minZoomLevel } = useMemo(() => {
    // Si es comercial, busca su zona específica
    if (user && user.rol === "comercial" && user.id_zona) {
      const userZona = zonas.find((z) => z.id === user.id_zona);

      if (userZona && userZona.area && userZona.area.length > 0) {
        // Calcular el centro de la zona
        const lats = userZona.area.map((p) => p.lat);
        const lngs = userZona.area.map((p) => p.lng);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const centerLat = (maxLat + minLat) / 2;
        const centerLng = (maxLng + minLng) / 2;

        // Calcular buffer (distancia adicional fuera de la zona)
        // El buffer es ~1.5 km en Córdoba
        const buffer = 0.015;

        // Crear bounds con buffer
        const boundsWithBuffer: LatLngBoundsExpression = [
          [minLat - buffer, minLng - buffer],
          [maxLat + buffer, maxLng + buffer],
        ];

        // Calcular zoom basado en el tamaño de la zona
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);

        // Zoom más cercano para comerciales (15-17)
        let zoom = 16;
        if (maxDiff > 0.05) zoom = 15;
        if (maxDiff > 0.1) zoom = 14;
        if (maxDiff > 0.15) zoom = 13;
        if (maxDiff > 0.2) zoom = 12;

        return {
          centerCoords: [centerLat, centerLng] as [number, number],
          zoomLevel: zoom,
          maxBounds: boundsWithBuffer,
          minZoomLevel: 14, // Comerciales no pueden hacer zoom out por debajo de 14
        };
      }
    }

    // Por defecto, usar Córdoba
    return {
      centerCoords: [37.8847, -4.7792] as [number, number],
      zoomLevel: 12,
      maxBounds: [
        [37.75, -5.02],
        [37.99, -4.62],
      ] as LatLngBoundsExpression,
      minZoomLevel: 11, // Admins pueden ver más allá
    };
  }, [user, zonas]);

  if (!user) {
    return <div>Usuario no autenticado</div>;
  }

  return (
    <div className="map-page">
      <Sidebar />
      <main className="map-content">
        {loading ? (
          <div className="map-loading">
            <p>Cargando mapa...</p>
          </div>
        ) : error ? (
          <div className="map-error">
            <p>Error: {error}</p>
          </div>
        ) : (
          <>
            <GlovalMap
              zonas={zonas}
              edificios={edificios}
              userRole={user.rol}
              userZonaId={user.id_zona ?? undefined}
              centerCoords={centerCoords}
              zoomLevel={zoomLevel}
              minZoomLevel={minZoomLevel}
              customMaxBounds={maxBounds}
              onEdificioClick={setSelectedEdificio}
              title={
                user.rol === "comercial"
                  ? "Mapa de tu Zona"
                  : "Mapa de Todas las Zonas"
              }
            />
            {selectedEdificio && (
              <MapaEdificioPanel
                edificio={selectedEdificio}
                isOpen={Boolean(selectedEdificio)}
                onClose={() => setSelectedEdificio(null)}
                userRole={user.rol}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MapPage;
