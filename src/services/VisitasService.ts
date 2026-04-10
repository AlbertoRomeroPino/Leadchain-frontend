import type { Visita, VisitaInput } from "../types/visitas/Visita";
import { ExceptionService } from "./ExceptionService";
import { authHttp } from "./https";

export const VisitasService = {

    async getVisitas() {
        try {
            const response = await authHttp.get("/api/visitas");
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener visitas"));
        }
    },

    async getVisitaById(id: number) {
        try {
            const response = await authHttp.get(`/api/visitas/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al obtener visita con ID ${id}`));
        }
    },

    async createVisita(visita: VisitaInput) {
        try {
            const response = await authHttp.post("/api/visitas", visita);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al crear visita"));
        }
    },

    async updateVisita(id: number, visita: VisitaInput) {
        try {
            const response = await authHttp.put(`/api/visitas/${id}`, visita);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al actualizar visita con ID ${id}`));
        }
    },

    async deleteVisita(id: number) {
        try {
            await authHttp.delete(`/api/visitas/${id}`);
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al eliminar visita con ID ${id}`));
        }
    },

    async patchVisita(id: number, visita: Partial<Visita>) {
        try {
            const response = await authHttp.patch(`/api/visitas/${id}`, visita);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al actualizar parcialmente visita con ID ${id}`));
        }
    },

    /**
     * Get consolidated data for visitas page
     * Returns: visitas, clientes, and estados in a single optimized request
     * Replaces 3 separate API calls with 1
     */
    async getVisitasPaginaDatos() {
        try {
            const response = await authHttp.get("/api/visitas/pagina/datos-consolidados");
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener datos de visitas"));
        }
    },
};