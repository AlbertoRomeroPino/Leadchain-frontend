import type { Zona } from "../types";
import { wrapServiceCall } from "./ExceptionService";
import { authHttp } from "./https";

export const ZonaService = {
  async getZonasPageData() {
    return wrapServiceCall(
      () => authHttp.get("/api/zonas/pagina/datos").then(r => r.data),
      "Error al obtener los datos de las zonas"
    );
  },

  async getZonas(): Promise<Zona[]> {
    return wrapServiceCall(
      () => authHttp.get<Zona[]>("/api/zonas").then(r => r.data),
      "Error al obtener las zonas"
    );
  },

  async createZona(zona: Omit<Zona, "id" | "created_at" | "updated_at">): Promise<Zona> {
    return wrapServiceCall(
      () => authHttp.post<Zona>("/api/zonas", zona).then(r => r.data),
      "Error al crear la zona"
    );
  },

  async updateZona(id: number, zona: Omit<Zona, "id" | "created_at" | "updated_at">): Promise<Zona> {
    return wrapServiceCall(
      () => authHttp.put<Zona>(`/api/zonas/${id}`, zona).then(r => r.data),
      `Error al actualizar la zona con ID ${id}`
    );
  },

  async deleteZona(id: number): Promise<void> {
    return wrapServiceCall(
      () => authHttp.delete(`/api/zonas/${id}`).then(() => undefined),
      `Error al eliminar la zona con ID ${id}`
    );
  },
};
