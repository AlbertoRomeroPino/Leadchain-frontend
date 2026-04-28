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

const AdminMapView = ({ userRole }: AdminMapViewProps) => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [edificios, setEdificios] = useState<Edificio[]>([]);

  useInitialize(async () => {
    try {
      showLoadingAlert("Cargando mapa...");

      // Cargar datos del mapa
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

      showSuccessAlert("Información cargada");
    } catch (err) {
      showErrorAlert(err, "Cargar Mapa");
      console.error("Error al cargar datos:", err);
    }
  });

  // Configuración para admin: ver toda la ciudad
  const centerCoords: [number, number] = [37.8847, -4.7792]; // Centro de Córdoba
  const zoomLevel = 12; // Zoom inicial para toda la ciudad
  const maxBounds: LatLngBoundsExpression = [
    [37.75, -5.02],
    [37.99, -4.62],
  ]; // Limitar a Córdoba con buffer
  const minZoomLevel = 11; // Admins pueden hacer zoom out más

  return (
    <GlovalMap
      zonas={zonas}
      edificios={edificios}
      userRole={userRole}
      centerCoords={centerCoords}
      zoomLevel={zoomLevel}
      minZoomLevel={minZoomLevel}
      customMaxBounds={maxBounds}
      title="Mapa de Todas las Zonas"
    />
  );
};

export default AdminMapView;
