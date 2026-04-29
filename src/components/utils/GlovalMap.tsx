import { MapContainer, Polygon, Rectangle, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/components/utils/GlovalMap.css";
import MapView from "../MapSetup/MapView";
import EdificioMarker from "../MapViews/EdificioMarker";
import ZoomCalculator from "../MapSetup/ZoomCalculator";
import {
  CORDOBA_BOUNDS,
  CORDOBA_CENTER,
  CORDOBA_MAP_CONFIG,
  CORDOBA_OUTER_RING,
  CORDOBA_HOLE,
} from "./cordobaMapConfig";
import type { Zona, Edificio, GeoPoint } from "../../types";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import { useMemo } from "react";
import L from "leaflet";

interface GlovalMapProps {
  zonas?: Zona[];
  edificios?: Edificio[];
  userRole?: string;
  userZonaId?: number;
  title?: string;
  centerCoords?: [number, number];
  zoomLevel?: number;
  minZoomLevel?: number;
  customMaxBounds?: LatLngBoundsExpression;
  enableMapBoundsSetup?: boolean;
  mapPaddingPixels?: number;
  mapExpansionFactor?: number;
  enableZoomCalculator?: boolean;
  onZoomCalculated?: (zoom: { minZoom: number; initialZoom: number }) => void;
  onEdificioClick?: (edificio: Edificio) => void;
}

const iconCache: Record<number, L.DivIcon> = {};

const getOrCreateIcon = (clientesCount = 0) => {
  if (iconCache[clientesCount]) {
    return iconCache[clientesCount];
  }

  const label = clientesCount > 99 ? "99+" : String(clientesCount);
  const newIcon = L.divIcon({
    html: `
      <div class="edificio-pin-icon">
        <span>${label}</span>
        <div class="edificio-pin-tail"></div>
      </div>
    `,
    className: "edificio-pin-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
  });

  iconCache[clientesCount] = newIcon;
  return newIcon;
};

// 1. EXTRAÍDO FUERA: Constantes que nunca cambian
const COLORES_ZONAS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

// 2. EXTRAÍDO FUERA: Funciones puras y validadores de tipos
type EdificioClientesCount = { count: number };

const isEdificioClientesCount = (value: unknown): value is EdificioClientesCount => {
  return (
    typeof value === "object" &&
    value !== null &&
    "count" in value &&
    typeof (value as Record<string, unknown>).count === "number"
  );
};

const convertirAreaAPoligono = (area: GeoPoint[]): LatLngExpression[] => {
  return area.map((punto) => [punto.lat, punto.lng]);
};

const GlovalMap = ({
  zonas = [],
  edificios = [],
  userRole = "admin",
  userZonaId,
  title = "Mapa de Córdoba",
  centerCoords = CORDOBA_CENTER,
  zoomLevel = CORDOBA_MAP_CONFIG.zoom,
  minZoomLevel = CORDOBA_MAP_CONFIG.minZoom,
  customMaxBounds = CORDOBA_MAP_CONFIG.maxBounds,
  enableMapBoundsSetup = false,
  mapPaddingPixels = 50,
  mapExpansionFactor = 1.2,
  enableZoomCalculator = false,
  onZoomCalculated,
}: GlovalMapProps) => {

  // Filtros principales (Memoizados)
  const zonasAMostrar = useMemo(() => {
    if (!zonas.length) return [];
    return userRole === "comercial" && userZonaId
      ? zonas.filter((zona) => zona.id === userZonaId)
      : zonas;
  }, [zonas, userRole, userZonaId]);

  const edificiosAMostrar = useMemo(() => {
    if (!edificios.length) return [];
    return userRole === "comercial" && userZonaId
      ? edificios.filter((edif) => edif.id_zona === userZonaId)
      : edificios;
  }, [edificios, userRole, userZonaId]);

  // 3. OPTIMIZACIÓN CRÍTICA O(1): Diccionario de Zonas
  // En lugar de hacer un .find() por cada edificio, creamos un mapa de acceso instantáneo
  const zonasLookup = useMemo(() => {
    return zonasAMostrar.reduce((acc, zona) => {
      acc[zona.id] = zona;
      return acc;
    }, {} as Record<number, Zona>);
  }, [zonasAMostrar]);

  

  // 5. SIMPLIFICACIÓN: Aprovechamos el filtro previo para no volver a buscar en el array
  const comercialZoneArea = useMemo(() => {
    if (userRole === "comercial" && zonasAMostrar.length > 0) {
      return zonasAMostrar[0].area ?? null;
    }
    return null;
  }, [userRole, zonasAMostrar]);

  // Pre-calcular conteos, polígonos y opciones visuales para no hacerlo en el return
  const zonasProcesadas = useMemo(() => {
    return zonasAMostrar.map((zona, index) => {
      const edificiosCount = zona.edificios?.length ?? 0;
      const clientesCount = zona.edificios?.reduce((total, edificio) => {
        return total + (edificio.clientes?.length || 0);
      }, 0) ?? 0;

      const poligono = zona.area ? convertirAreaAPoligono(zona.area) : [];
      const colorZona = COLORES_ZONAS[index % COLORES_ZONAS.length];
      
      const isComercialView = userRole === "comercial" && userZonaId === zona.id;
      const pathOptions = isComercialView
        ? { color: "#dc2626", weight: 5, fillColor: "transparent", fillOpacity: 0, dashArray: "5, 5" }
        : { color: colorZona, weight: 2, fillColor: colorZona, fillOpacity: 0.25 };

      return { zona, edificiosCount, clientesCount, poligono, pathOptions };
    });
  }, [zonasAMostrar, userRole, userZonaId]);

  return (
    <div className="gloval-map-wrapper">
      <div className="gloval-map-header">
        <h2 className="gloval-map-title">{title}</h2>
        {zonasAMostrar.length > 0 && userRole !== "comercial" && (
          <p className="gloval-map-info">
            Mostrando {zonasAMostrar.length} zona{zonasAMostrar.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="gloval-map-canvas-wrapper">
        <MapContainer
          center={centerCoords}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={CORDOBA_MAP_CONFIG.attributionControl}
          maxBounds={customMaxBounds}
          maxBoundsViscosity={userRole === "comercial" ? 0.5 : CORDOBA_MAP_CONFIG.maxBoundsViscosity}
          minZoom={minZoomLevel}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          boxZoom={true}
          className="gloval-map-canvas"
        >
          {enableMapBoundsSetup && (
            <MapView
              userRole={userRole}
              zoneArea={comercialZoneArea}
              paddingPixels={mapPaddingPixels}
              expansionFactor={mapExpansionFactor}
            />
          )}

          {enableZoomCalculator && (
            <ZoomCalculator
              zoneArea={comercialZoneArea}
              onZoomCalculated={onZoomCalculated}
            />
          )}

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {userRole !== "comercial" && (
            <>
              <Polygon
                positions={[CORDOBA_OUTER_RING, CORDOBA_HOLE]}
                pathOptions={{ color: "transparent", fillColor: "#0f0a0a", fillOpacity: 0.45 }}
                interactive={false}
              />
              <Rectangle
                bounds={CORDOBA_BOUNDS}
                pathOptions={{ color: "#dc2626", weight: 3, fillOpacity: 0 }}
                interactive={false}
              />
            </>
          )}

          {/* Renderizado limpio y directo de zonas */}
          {zonasProcesadas.map(({ zona, poligono, pathOptions }) => {
            if (poligono.length === 0) return null;
            return (
              <Polygon
                key={zona.id}
                positions={poligono}
                pathOptions={pathOptions}
                interactive={false}
              />
            );
          })}

          {/* Renderizado de edificios utilizando diccionario y caché */}
          {edificiosAMostrar.map((edificio) => {
            if (!edificio.ubicacion) return null;

            let clientesCount = 0;
            if (Array.isArray(edificio.clientes)) {
              clientesCount = edificio.clientes.length;
            } else if (isEdificioClientesCount(edificio.clientes)) {
              clientesCount = edificio.clientes.count;
            }

            // Búsqueda instantánea en O(1) en lugar de un .find()
            const edificioZona = zonasLookup[edificio.id_zona];

            return (
              <EdificioMarker
                key={`edificio-${edificio.id}`}
                edificio={edificio}
                zona={edificioZona}
                icon={getOrCreateIcon(clientesCount)}
              />
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default GlovalMap;