import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { GeoPoint } from '../../../types/shared/GeoPoint'

interface EdificioInfoMapCardProps {
  ubicacion: { lat: number; lng: number } | null
  direccion: string
  zonaArea?: GeoPoint[] | null
}

const EdificioInfoMapCard = ({ ubicacion, direccion, zonaArea }: EdificioInfoMapCardProps) => {
  const hasZonaArea = !!zonaArea && zonaArea.length > 0
  const center: [number, number] = ubicacion
    ? [ubicacion.lat, ubicacion.lng]
    : hasZonaArea
      ? [zonaArea![0].lat, zonaArea![0].lng]
      : [37.75, -4.95]

  const polygonPoints = (zonaArea ?? []).map((p) => [p.lat, p.lng] as [number, number])

  const pointInPolygon = (point: L.LatLngLiteral, polygon: [number, number][]) => {
    const x = point.lng
    const y = point.lat
    let inside = false

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const yi = polygon[i][0]
      const xi = polygon[i][1]
      const yj = polygon[j][0]
      const xj = polygon[j][1]

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }

  const MapSetup = () => {
    const map = useMap()

    useEffect(() => {
      if (!hasZonaArea || !polygonPoints.length) return

      const bounds = L.latLngBounds(polygonPoints)
      map.setMaxBounds(bounds)
      map.fitBounds(bounds, { padding: [20, 20] })
      const minZoom = map.getBoundsZoom(bounds, false)
      map.setMinZoom(minZoom)
      map.setMaxZoom(minZoom + 2)

      const ensureInPolygon = () => {
        const center = map.getCenter()
        if (pointInPolygon({ lat: center.lat, lng: center.lng }, polygonPoints)) return
        map.panInsideBounds(bounds, { animate: true })
      }

      map.on('moveend', ensureInPolygon)
      return () => {
        map.off('moveend', ensureInPolygon)
      }
    }, [map])

    return null
  }


  return (
    <div className="edificio-card edificio-map-card" style={{ position: 'relative' }}>
      <h2 className="edificio-map-title">Mapa del edificio</h2>
      <MapContainer
        center={center}
        zoom={hasZonaArea ? 13 : 16}
        scrollWheelZoom={true}
        className="edificio-map-leaflet"
        bounds={hasZonaArea ? zonaArea?.map((p) => [p.lat, p.lng] as [number, number]) : undefined}
        maxBounds={hasZonaArea ? zonaArea?.map((p) => [p.lat, p.lng] as [number, number]) : undefined}
        maxBoundsViscosity={1.0}
        dragging={hasZonaArea}
        touchZoom={hasZonaArea}
        doubleClickZoom={hasZonaArea}
        zoomControl={hasZonaArea}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapSetup />
        {hasZonaArea && zonaArea ? (
          <Polygon
            positions={zonaArea.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: '#2563eb', weight: 2, fillColor: '#60a5fa', fillOpacity: 0.2 }}
          />
        ) : null}

        {ubicacion ? (
          <CircleMarker
            center={[ubicacion.lat, ubicacion.lng]}
            radius={10}
            pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.8 }}
          >
            <Popup>{direccion}</Popup>
          </CircleMarker>
        ) : (
          <p>No hay ubicación disponible para este edificio.</p>
        )}
      </MapContainer>
      {hasZonaArea && <p style={{ color: '#94a3b8', margin: '8px 0 0' }}>Límite de zona mostrado en azul.</p>}
    </div>
  )
}

export default EdificioInfoMapCard