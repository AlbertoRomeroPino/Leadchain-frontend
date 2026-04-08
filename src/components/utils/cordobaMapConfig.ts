/**
 * Configuración centralizada de mapas para Córdoba
 * Utilidad para reutilizar los límites, rectángulos y polígonos
 * en todos los mapas de la aplicación
 */

import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

// ==================== COORDENADAS DE CÓRDOBA ====================

/** 
 * Límites del rectángulo que representa Córdoba
 * Formato: [[lat_sur, lng_oeste], [lat_norte, lng_este]]
 */
export const CORDOBA_BOUNDS: LatLngBoundsExpression = [
  [37.785, -4.965],
  [37.965, -4.665],
];

/** 
 * Límites máximos del mapa (un poco más allá de Córdoba para permitir scroll)
 */
export const MAP_MAX_BOUNDS: LatLngBoundsExpression = [
  [37.75, -5.02],
  [37.99, -4.62],
];

/** 
 * Centro de Córdoba para centrar el mapa por defecto
 */
export const CORDOBA_CENTER: LatLngExpression = [37.8847, -4.7792];

// ==================== COORDENADAS EXTRAIDAS ====================

/** Esquina suroeste del rectángulo de Córdoba */
export const CORDOBA_SOUTHWEST: [number, number] = [37.785, -4.965];

/** Esquina noreste del rectángulo de Córdoba */
export const CORDOBA_NORTHEAST: [number, number] = [37.965, -4.665];

// ==================== POLÍGONOS PARA EL MAPA ====================

/**
 * Polígono exterior que cubre toda la región
 * Se usa en conjunción con cordobaHole para crear efecto de oscurecimiento
 */
export const CORDOBA_OUTER_RING: LatLngExpression[] = [
  [-90, -180],
  [-90, 180],
  [90, 180],
  [90, -180],
];

/**
 * Agujero en el polígono exterior para dejar visible solo Córdoba
 * Crea el efecto de oscurecer todo excepto Córdoba
 */
export const CORDOBA_HOLE: LatLngExpression[] = [
  [CORDOBA_SOUTHWEST[0], CORDOBA_SOUTHWEST[1]],
  [CORDOBA_SOUTHWEST[0], CORDOBA_NORTHEAST[1]],
  [CORDOBA_NORTHEAST[0], CORDOBA_NORTHEAST[1]],
  [CORDOBA_NORTHEAST[0], CORDOBA_SOUTHWEST[1]],
];

// ==================== FUNCIONES UTILIDAD ====================

/**
 * Verifica si un punto (lat, lng) está dentro de los límites de Córdoba
 * @param lat - Latitud del punto
 * @param lng - Longitud del punto
 * @returns true si el punto está dentro de Córdoba, false en caso contrario
 */
export const isPuntoDentroCordoba = (lat: number, lng: number): boolean => {
  return (
    lat >= CORDOBA_SOUTHWEST[0] &&
    lat <= CORDOBA_NORTHEAST[0] &&
    lng >= CORDOBA_SOUTHWEST[1] &&
    lng <= CORDOBA_NORTHEAST[1]
  );
};

/**
 * Verifica si múltiples puntos están dentro de los límites de Córdoba
 * @param puntos - Array de puntos {lat, lng}
 * @returns true si todos los puntos están dentro de Córdoba
 */
export const sonPuntosDentroCordoba = (
  puntos: Array<{ lat: number; lng: number }>
): boolean => {
  return puntos.every((p) => isPuntoDentroCordoba(p.lat, p.lng));
};

/**
 * Obtiene el centro del polígono basándose en los puntos
 * @param puntos - Array de puntos {lat, lng}
 * @returns Centro calculado como promedio de latitud y longitud
 */
export const getCentroPoligono = (
  puntos: Array<{ lat: number; lng: number }>
): [number, number] => {
  if (puntos.length === 0) return CORDOBA_CENTER;

  const avgLat = puntos.reduce((sum, p) => sum + p.lat, 0) / puntos.length;
  const avgLng = puntos.reduce((sum, p) => sum + p.lng, 0) / puntos.length;

  return [avgLat, avgLng];
};

// ==================== CONFIGURACIÓN DE PROPS ====================

/**
 * Props estándar para inicializar un MapContainer para Córdoba
 */
export const CORDOBA_MAP_CONFIG = {
  zoom: 13,
  zoomControl: false,
  attributionControl: false,
  maxBounds: MAP_MAX_BOUNDS,
  maxBoundsViscosity: 1,
  minZoom: 11,
} as const;
