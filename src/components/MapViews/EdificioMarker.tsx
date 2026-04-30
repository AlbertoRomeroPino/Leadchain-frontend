import { memo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Edificio, Cliente, Zona } from "../../types";

interface EdificioMarkerProps {
  edificio: Edificio;
  zona?: Zona | null;
  icon: L.DivIcon;
}

// Función de formateo extraída (Hoisting)
const getNombreCompleto = (cliente: Cliente) => {
  const nombre = `${cliente.nombre ?? ""} ${cliente.apellidos ?? ""}`.trim();
  if (nombre.length <= 40) return nombre;
  return `${nombre.slice(0, 37).trimEnd()}...`;
};

/**
 * Componente memoizado para cada marcador de edificio
 * Evita que se re-rendericen todos los edificios cuando cambia algo
 */
const EdificioMarker = memo(({ edificio, zona, icon }: EdificioMarkerProps) => {
  if (!edificio.ubicacion) return null;

  let clientesCount = 0;

  // Evaluando directamente, TypeScript entiende que aquí dentro SÍ es un array
  if (Array.isArray(edificio.clientes)) {
    clientesCount = edificio.clientes.length;
  } else if (
    edificio.clientes &&
    typeof edificio.clientes === "object" &&
    "count" in edificio.clientes
  ) {
    clientesCount = (edificio.clientes as { count: number }).count;
  }

  // Extraemos la lista de clientes asegurando el tipo directamente en la evaluación
  const clientesList = Array.isArray(edificio.clientes)
    ? (edificio.clientes as (Cliente & { planta?: string | null; puerta?: string | null })[])
    : [];

  return (
    <Marker position={[edificio.ubicacion.lat, edificio.ubicacion.lng]} icon={icon}>
      <Popup
        className="custom-popup"
        autoPan={true}
        autoPanPadding={[50, 100]}
        offset={[0, -20]}
      >
        <div className="popup-content">
          <p className="popup-address">
            {edificio.direccion_completa ?? "Dirección no disponible"}
          </p>
          <p className="popup-info">
            {clientesCount > 0
              ? `${clientesCount} cliente${clientesCount !== 1 ? "s" : ""} en esta ubicación`
              : "Sin clientes asignados"}
          </p>
          <p className="popup-zone">
            <strong>Zona:</strong> {zona?.nombre ?? "No encontrada"}
          </p>
          <div className="popup-list">
            {clientesList.map((cliente, idx) => (
              <div
                key={`cliente-${cliente.id || idx}-edif-${edificio.id}`}
                className="popup-item"
              >
                <div>
                  <p className="popup-client-name">
                    {getNombreCompleto(cliente)}
                  </p>
                  <p className="popup-client-details">
                    Piso: {cliente.planta ?? "N/A"} • Puerta: {cliente.puerta ?? "N/A"}
                    <br />
                    Tel: {cliente.telefono ?? "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

EdificioMarker.displayName = "EdificioMarker";

export default EdificioMarker;