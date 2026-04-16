import { memo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Edificio } from "../../types/edificios/Edificio";
import type { Cliente } from "../../types/clientes/Cliente";

interface EdificioMarkerProps {
  edificio: Edificio;
  icon: L.DivIcon;
}

/**
 * Componente memoizado para cada marcador de edificio
 * Evita que se re-rendericen todos los edificios cuando cambia algo
 */
const EdificioMarker = memo(({ edificio, icon }: EdificioMarkerProps) => {
  if (!edificio.ubicacion) return null;

  // Obtener el conteo de clientes - puede ser array u objeto con count
  let clientesCount = 0;

  if (Array.isArray(edificio.clientes)) {
    clientesCount = edificio.clientes.length;
  } else if (edificio.clientes && typeof edificio.clientes === 'object' && 'count' in edificio.clientes) {
    clientesCount = (edificio.clientes as { count: number }).count;
  }

  const clientesConEdificio = Array.isArray(edificio.clientes)
    ? edificio.clientes.map((cliente: Cliente & { planta?: string | null; puerta?: string | null }) => ({
        cliente,
        edificio,
      }))
    : [];

  return (
    <Marker
      key={`edificio-${edificio.id}`}
      position={[edificio.ubicacion.lat, edificio.ubicacion.lng]}
      icon={icon}
    >
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
          <div className="popup-list">
            {clientesConEdificio.map((item, idx) => (
              <div
                key={`${item.cliente.id}-${item.edificio.id}-${idx}`}
                className="popup-item"
              >
                <div>
                  <p className="popup-client-name">
                    {item.cliente.nombre} {item.cliente.apellidos}
                  </p>
                  <p className="popup-client-details">
                    Piso: {item.cliente.planta ?? "N/A"} • Puerta: {item.cliente.puerta ?? "N/A"}
                    <br />
                    Tel: {item.cliente.telefono ?? "N/A"}
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
