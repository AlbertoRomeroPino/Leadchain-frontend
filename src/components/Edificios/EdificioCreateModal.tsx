import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from "react-leaflet";
import L, { type LatLngLiteral } from "leaflet";
import type { EdificioInput, Edificio } from "../../types/edificios/Edificio";
import type { Zona } from "../../types/zonas/Zona";

interface EdificioCreateModalProps {
  show: boolean;
  loading: boolean;
  zonas: Zona[];
  edificios: Edificio[];
  onClose: () => void;
  onCreateEdificio: (payload: EdificioInput) => Promise<void>;
  onAppendToExisting: (edificioId: number, clienteNombre: string, clienteApellidos: string) => Promise<void>;
}

const EdificioCreateModal = ({
  show,
  loading,
  zonas,
  edificios,
  onClose,
  onCreateEdificio,
  onAppendToExisting,
}: EdificioCreateModalProps) => {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [direccionCompleta, setDireccionCompleta] = useState("");
  const [tipo, setTipo] = useState("");
  const [idZona, setIdZona] = useState<number>(zonas?.[0]?.id ?? 0);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [existingEdificioId, setExistingEdificioId] = useState<number>(edificios?.[0]?.id ?? 0);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteApellidos, setClienteApellidos] = useState("");

  const selectedZona = useMemo(() => zonas.find((z) => z.id === idZona), [idZona, zonas]);
  const zonaArea = useMemo(() => selectedZona?.area ?? [], [selectedZona]);
  const zonaPolygon = useMemo(() => {
    if (!zonaArea.length) return null;
    return L.polygon(zonaArea.map((p) => [p.lat, p.lng] as [number, number]));
  }, [zonaArea]);
  const zonaBounds = zonaPolygon?.getBounds();

  const MapSetup = () => {
    const map = useMap()

    useEffect(() => {
      if (!zonaBounds || !zonaArea.length) return

      map.setMaxBounds(zonaBounds)
      map.fitBounds(zonaBounds, { padding: [20, 20] })
      const minZoom = map.getBoundsZoom(zonaBounds, false)
      map.setMinZoom(minZoom)
      map.setMaxZoom(minZoom + 2)

      const validateCenter = () => {
        const center = map.getCenter()
        if (pointInPolygon({ lat: center.lat, lng: center.lng }, zonaArea.map((p) => [p.lat, p.lng] as [number, number]))) return
        map.panInsideBounds(zonaBounds, { animate: true })
      }

      map.on("moveend", validateCenter)
      return () => {
        map.off("moveend", validateCenter)
      }
    }, [map])

    return null
  }

  const pointInPolygon = (point: LatLngLiteral, polygon: [number, number][]) => {
    // polygon points are [lat, lng]
    // Treat x = lng, y = lat for ray-casting
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

  const MapSelection = ({ onSelect }: { onSelect: (coords: LatLngLiteral) => void }) => {
    useMapEvents({
      click(event) {
        const polygonPoints = zonaArea.map((p) => [p.lat, p.lng] as [number, number])
        if (!zonaPolygon || pointInPolygon(event.latlng, polygonPoints)) {
          onSelect(event.latlng);
        } else {
          window.alert("La ubicación debe estar dentro de los límites de la zona.");
        }
      },
    });
    return null;
  };

  useEffect(() => {
    if (!show) return;
    setMode("new");
    setDireccionCompleta("");
    setTipo("");
    setIdZona(zonas?.[0]?.id ?? 0);
    setLat(null);
    setLng(null);
    setExistingEdificioId(edificios?.[0]?.id ?? 0);
    setClienteNombre("");
    setClienteApellidos("");
  }, [show, zonas, edificios]);



  if (!show) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === "new") {
      if (!direccionCompleta || !tipo || !idZona || lat == null || lng == null) {
        alert("Completa todos los datos y elige ubicación en el mapa");
        return;
      }
      await onCreateEdificio({
        direccion_completa: direccionCompleta,
        tipo,
        id_zona: idZona,
        ubicacion: { lat, lng },
        planta: null,
        puerta: null,
        id_cliente: null,
      });
      onClose();
      return;
    }

    if (mode === "existing") {
      if (!existingEdificioId || !clienteNombre || !clienteApellidos) {
        alert("Selecciona edificio y completa datos del cliente");
        return;
      }
      await onAppendToExisting(existingEdificioId, clienteNombre, clienteApellidos);
      onClose();
    }
  };

  return (
    <div className="clientes-modal-overlay" onClick={onClose}>
      <div className="clientes-modal" onClick={(event) => event.stopPropagation()}>
        <div className="edificio-create-tabs">
          <button
            type="button"
            className={mode === "new" ? "tab-btn active" : "tab-btn"}
            onClick={() => setMode("new")}
          >
            Crear edificio
          </button>
          <button
            type="button"
            className={mode === "existing" ? "tab-btn active" : "tab-btn"}
            onClick={() => setMode("existing")}
          >
            Añadir cliente
          </button>
        </div>

        <form className="form-cliente" onSubmit={handleSubmit}>
          {mode === "new" ? (
            <>
              <h2 className="form-cliente-title">Crear edificio</h2>
              <input
                className="form-cliente-input"
                type="text"
                placeholder="Dirección completa"
                value={direccionCompleta}
                onChange={(e) => setDireccionCompleta(e.target.value)}
                required
              />
              <input
                className="form-cliente-input"
                type="text"
                placeholder="Tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
              />
              <select
                className="form-cliente-input"
                value={idZona}
                onChange={(e) => setIdZona(Number(e.target.value))}
              >
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>{z.nombre_zona}</option>
                ))}
              </select>

              <div style={{ position: "relative" }}>
                <label className="form-cliente-title" style={{ fontSize: "1rem", marginBottom: "8px" }}>Seleccionar ubicación en mapa</label>
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
                  <MapSelection onSelect={(pos) => {
                    setLat(pos.lat);
                    setLng(pos.lng);
                  }} />

                  {zonas.find((z) => z.id === idZona)?.area?.length ? (
                    <Polygon
                      positions={zonas
                        .find((z) => z.id === idZona)
                        ?.area?.map((p) => [p.lat, p.lng] as [number, number]) || []}
                      pathOptions={{ color: "#2563eb", weight: 2, fillColor: "#60a5fa", fillOpacity: 0.2 }}
                    />
                  ) : null}

                  {lat != null && lng != null ? (
                    <Marker position={[lat, lng]}>
                      <Popup>Ubicación seleccionada</Popup>
                    </Marker>
                  ) : null}

                              <MapSelection onSelect={(pos) => {
                    setLat(pos.lat);
                    setLng(pos.lng);
                  }} />
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
            </>
          ) : (
            <>
              <h2 className="form-cliente-title">Añadir cliente a edificio existente</h2>
              <select
                className="form-cliente-input"
                value={existingEdificioId}
                onChange={(e) => setExistingEdificioId(Number(e.target.value))}
              >
                {edificios.map((ed) => (
                  <option key={ed.id} value={ed.id}>{ed.direccion_completa}</option>
                ))}
              </select>
              <input
                className="form-cliente-input"
                type="text"
                placeholder="Nombre cliente"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                required
              />
              <input
                className="form-cliente-input"
                type="text"
                placeholder="Apellidos cliente"
                value={clienteApellidos}
                onChange={(e) => setClienteApellidos(e.target.value)}
                required
              />
            </>
          )}

          <div className="form-cliente-actions">
            <button className="form-cliente-cancel" type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button className="form-cliente-submit" type="submit" disabled={loading}>
              {loading
                ? mode === "new"
                  ? "Creando..."
                  : "Añadiendo..."
                : mode === "new"
                  ? "Crear edificio"
                  : "Añadir cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EdificioCreateModal;
