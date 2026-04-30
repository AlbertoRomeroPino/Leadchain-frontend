import type { Visita, VisitaInput } from "../types";
import { wrapServiceCall } from "./ExceptionService";
import { authHttp } from "./https";

export const VisitasService = {
  async createVisita(visita: VisitaInput): Promise<Visita> {
    return wrapServiceCall(
      () => authHttp.post<Visita>("/api/visitas", visita).then(r => r.data),
      "Error al crear visita"
    );
  },

  async updateVisita(id: number, visita: VisitaInput): Promise<Visita> {
    return wrapServiceCall(
      () => authHttp.put<Visita>(`/api/visitas/${id}`, visita).then(r => r.data),
      `Error al actualizar visita con ID ${id}`
    );
  },

  async deleteVisita(id: number): Promise<void> {
    return wrapServiceCall(
      () => authHttp.delete(`/api/visitas/${id}`).then(() => undefined),
      `Error al eliminar visita con ID ${id}`
    );
  },

  async patchVisita(id: number, visita: Partial<Visita>): Promise<Visita> {
    return wrapServiceCall(
      () => authHttp.patch<Visita>(`/api/visitas/${id}`, visita).then(r => r.data),
      `Error al actualizar parcialmente visita con ID ${id}`
    );
  },

  /**
   * Get consolidated data for visitas page
   * Returns: visitas, clientes, and estados in a single optimized request
   * Replaces 3 separate API calls with 1
   */
  async getVisitasPaginaDatos() {
    return wrapServiceCall(
      () => authHttp.get("/api/visitas/pagina/datos-consolidados").then(r => r.data),
      "Error al obtener datos de visitas"
    );
  },
};
