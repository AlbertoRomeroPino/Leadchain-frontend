import { authHttp } from "./https";
import { ExceptionService } from "./ExceptionService";
import type {
  EdificioInput,
  EdificioClienteBlock,
} from "../types/edificios/Edificio";


export const EdificiosService = {

    async getEdificios() {
        try {
            const response = await authHttp.get("/api/edificios");
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener edificios"));
        }
    },

    async getEdificioDetalle(id: number) {
        try {
            const response = await authHttp.get(`/api/edificios/${id}/detalle`);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al obtener detalles del edificio con ID ${id}`));
        }
    },

    async createEdificio(edificio: EdificioInput) {
        try {
            const response = await authHttp.post("/api/edificios", edificio);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al crear edificio"));
        }
    },

    async updateEdificio(id: number, edificio: EdificioInput) {
        try {
            const response = await authHttp.put(`/api/edificios/${id}`, edificio);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al actualizar edificio con ID ${id}`));
        }
    },

    async deleteEdificio(id: number) {
        try {
            await authHttp.delete(`/api/edificios/${id}`);
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al eliminar edificio con ID ${id}`));
        }
    },

    async detachCliente(edificioId: number, clienteId: number) {
        try {
            const response = await authHttp.delete(`/api/edificios/${edificioId}/clientes/${clienteId}`);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al desadjuntar cliente"));
        }
    },

    async attachMultipleClientes(
        edificioId: number,
        clientes: EdificioClienteBlock[],
    ) {
        try {
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

            const response = await authHttp.post(
                `/api/edificios/${edificioId}/clientes/adjuntar-varios`,
                payload
            );
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al adjuntar múltiples clientes"));
        }
    },

}