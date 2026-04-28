import { authHttp } from "./https";
import { wrapServiceCall } from "./ExceptionService";
import type { EdificioInput, EdificioClienteBlock } from "../types";

export const EdificiosService = {
  async getEdificios() {
    return wrapServiceCall(
      () => authHttp.get("/api/edificios").then(r => r.data),
      "Error al obtener edificios"
    );
  },

  async getEdificioDetalle(id: number) {
    return wrapServiceCall(
      () => authHttp.get(`/api/edificios/${id}/detalle`).then(r => r.data),
      `Error al obtener detalles del edificio con ID ${id}`
    );
  },

  async createEdificio(edificio: EdificioInput) {
    return wrapServiceCall(
      () => authHttp.post("/api/edificios", edificio).then(r => r.data),
      "Error al crear edificio"
    );
  },

  async updateEdificio(id: number, edificio: EdificioInput) {
    return wrapServiceCall(
      () => authHttp.put(`/api/edificios/${id}`, edificio).then(r => r.data),
      `Error al actualizar edificio con ID ${id}`
    );
  },

  async deleteEdificio(id: number): Promise<void> {
    return wrapServiceCall(
      () => authHttp.delete(`/api/edificios/${id}`).then(() => undefined),
      `Error al eliminar edificio con ID ${id}`
    );
  },

  async detachCliente(edificioId: number, clienteId: number) {
    return wrapServiceCall(
      () => authHttp.delete(`/api/edificios/${edificioId}/clientes/${clienteId}`).then(r => r.data),
      "Error al desadjuntar cliente"
    );
  },

  async attachMultipleClientes(edificioId: number, clientes: EdificioClienteBlock[]) {
    return wrapServiceCall(
      () => {
        const payload = {
          clientes: clientes.map((c) => ({
            mode: c.mode,
            ...(c.mode === "crear" && {
              nombre: c.nombre,
              apellidos: c.apellidos,
              email: c.email,
              telefono: c.telefono,
            }),
            ...(c.mode === "seleccionar" && {
              clienteId: c.clienteSinEdificioId,
            }),
            planta: c.planta,
            puerta: c.puerta,
          })),
        };
        return authHttp.post(`/api/edificios/${edificioId}/clientes/adjuntar-varios`, payload).then(r => r.data);
      },
      "Error al adjuntar múltiples clientes"
    );
  },
};
