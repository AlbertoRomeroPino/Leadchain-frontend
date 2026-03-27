import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { type LatLngLiteral } from "leaflet";

interface EdificioModalMapaProps {
  idZona: number;
  zonas: {
    id: number;
    nombre_zona: string;
    area: { lat: number; lng: number }[] | null;
  }[];
  lat: number | null;
  lng: number | null;
  setLat: (lat: number | null) => void;
  setLng: (lng: number | null) => void;
}

const EdificioModalMapa = ({
  idZona,
  zonas,
  lat,
  lng,
  setLat,
  setLng,
}: EdificioModalMapaProps) => {
  const selectedZona = useMemo(
    () => zonas.find((z) => z.id === idZona),
    [idZona, zonas],
  );
  const zonaArea = useMemo(() => selectedZona?.area ?? [], [selectedZona]);

  const zonaPolygon = useMemo(() => {
    if (!zonaArea.length) return null;
    return L.polygon(zonaArea.map((p) => [p.lat, p.lng] as [number, number]));
  }, [zonaArea]);
  const zonaBounds = zonaPolygon?.getBounds();

  const MapSetup = () => {
    const map = useMap();

    useEffect(() => {
      if (!zonaBounds || !zonaArea.length) return;

      map.setMaxBounds(zonaBounds);
      map.fitBounds(zonaBounds, { padding: [20, 20] });
      const minZoom = map.getBoundsZoom(zonaBounds, false);
      map.setMinZoom(minZoom);
      map.setMaxZoom(minZoom + 2);

      const validateCenter = () => {
        const center = map.getCenter();
        if (
          pointInPolygon(
            { lat: center.lat, lng: center.lng },
            zonaArea.map((p) => [p.lat, p.lng] as [number, number]),
          )
        )
          return;
        map.panInsideBounds(zonaBounds, { animate: true });
      };

      map.on("moveend", validateCenter);
      return () => {
        map.off("moveend", validateCenter);
      };
    }, [map]);

    return null;
  };

  const pointInPolygon = (
    point: LatLngLiteral,
    polygon: [number, number][],
  ) => {
    // polygon points are [lat, lng]
    // Treat x = lng, y = lat for ray-casting
    const x = point.lng;
    const y = point.lat;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const yi = polygon[i][0];
      const xi = polygon[i][1];
      const yj = polygon[j][0];
      const xj = polygon[j][1];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const MapSelection = ({
    onSelect,
  }: {
    onSelect: (coords: LatLngLiteral) => void;
  }) => {
    useMapEvents({
      click(event) {
        const polygonPoints = zonaArea.map(
          (p) => [p.lat, p.lng] as [number, number],
        );
        if (!zonaPolygon || pointInPolygon(event.latlng, polygonPoints)) {
          onSelect(event.latlng);
        } else {
          window.alert(
            "La ubicación debe estar dentro de los límites de la zona.",
          );
        }
      },
    });
    return null;
  };

  return (
    <div style={{ position: "relative" }}>
      <label
        className="form-edificio-title"
        style={{ fontSize: "1rem", marginBottom: "8px" }}
      >
        Seleccionar ubicación en mapa
      </label>
      <MapContainer
        center={
          lat != null && lng != null
            ? [lat, lng]
            : zonaArea.length
              ? [zonaArea[0].lat, zonaArea[0].lng]
              : [37.75, -4.95]
        }
        zoom={zonaArea.length ? 13 : 11}
        bounds={zonaBounds}
        maxBounds={zonaBounds}
        maxBoundsViscosity={1.0}
        className="edificio-create-map"
        scrollWheelZoom={true}
        dragging={!!zonaBounds}
        touchZoom={!!zonaBounds}
        doubleClickZoom={!!zonaBounds}
        zoomControl={!!zonaBounds}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapSetup />
        <MapSelection
          onSelect={(pos) => {
            setLat(pos.lat);
            setLng(pos.lng);
          }}
        />

        {zonas.find((z) => z.id === idZona)?.area?.length ? (
          <Polygon
            positions={
              zonas
                .find((z) => z.id === idZona)
                ?.area?.map((p) => [p.lat, p.lng] as [number, number]) || []
            }
            pathOptions={{
              color: "#2563eb",
              weight: 2,
              fillColor: "#60a5fa",
              fillOpacity: 0.2,
            }}
          />
        ) : null}

        {lat != null && lng != null ? (
          <Marker position={[lat, lng]}>
            <Popup>Ubicación seleccionada</Popup>
          </Marker>
        ) : null}

        <MapSelection
          onSelect={(pos) => {
            setLat(pos.lat);
            setLng(pos.lng);
          }}
        />
      </MapContainer>

      {lat != null && lng != null ? (
        <p style={{ marginTop: 8, color: "#d1d5db" }}>
          Coordenadas seleccionadas: {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      ) : (
        <p style={{ marginTop: 8, color: "#9ca3af" }}>
          Haz clic en el mapa para ubicar el edificio.
        </p>
      )}
    </div>
  );
};

export default EdificioModalMapa;
