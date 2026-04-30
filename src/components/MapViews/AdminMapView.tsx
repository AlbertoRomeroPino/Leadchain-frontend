import { useState } from "react";
import GlovalMap from "../utils/GlovalMap";
import { InicioService } from "../../services/InicioService";
import { useInitialize } from "../../hooks/useInitialize";
import { showLoadingAlert, showErrorAlert, showSuccessAlert } from "../utils/errorHandler";
import type { Zona, Edificio } from "../../types";
import type { LatLngBoundsExpression } from "leaflet";

interface AdminMapViewProps {
  userRole?: string;
}

// 1. Extraemos la configuración estática fuera del componente
// Esto evita que estas variables se recreen en la memoria cada vez que React renderiza
const ADMIN_MAP_CONFIG = {
  centerCoords: [37.8847, -4.7792] as [number, number], // Centro de Córdoba
  zoomLevel: 12, // Zoom inicial para toda la ciudad
  minZoomLevel: 11, // Admins pueden hacer zoom out más
  maxBounds: [
    [37.75, -5.02],
    [37.99, -4.62],
  ] as LatLngBoundsExpression, // Limitar a Córdoba con buffer
};

const AdminMapView = ({ userRole }: AdminMapViewProps) => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [edificios, setEdificios] = useState<Edificio[]>([]);

  useInitialize(async () => {
    try {
      showLoadingAlert("Cargando mapa...");

      // Cargar datos del mapa
      const mapData = await InicioService.getMapaInicio();
      setZonas(mapData.zonas);

      // 2. Optimización con flatMap: Extraer y aplanar en un solo paso
      // Reemplaza el doble forEach, siendo más rápido y limpio
      const todosEdificios = mapData.zonas.flatMap((zona) => 
        Array.isArray(zona.edificios) ? (zona.edificios as Edificio[]) : []
      );

      setEdificios(todosEdificios);

      showSuccessAlert("Información cargada");
    } catch (err) {
      showErrorAlert(err, "Cargar Mapa");
      console.error("Error al cargar datos:", err);
    }
  });

  return (
    <GlovalMap
      zonas={zonas}
      edificios={edificios}
      userRole={userRole}
      centerCoords={ADMIN_MAP_CONFIG.centerCoords}
      zoomLevel={ADMIN_MAP_CONFIG.zoomLevel}
      minZoomLevel={ADMIN_MAP_CONFIG.minZoomLevel}
      customMaxBounds={ADMIN_MAP_CONFIG.maxBounds}
      title="Mapa de Todas las Zonas"
    />
  );
};

export default AdminMapView;