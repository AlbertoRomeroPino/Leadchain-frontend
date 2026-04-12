import type { Zona } from "../types/zonas/Zona";
import { ExceptionService } from "./ExceptionService";
import { authHttp } from "./https";


export const ZonaService = {
    async getZonasPageData() {
        try {
            const response = await authHttp.get("/api/zonas/pagina/datos");
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener los datos de las zonas"));
        }
    },

    async getZonaById(id: number) {
        try {
            const response = await authHttp.get(`/api/zonas/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener la zona"));
        }
    },

    async getZonas() {
        try {
            const response = await authHttp.get("/api/zonas");
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener las zonas"));
        }
    },

    async createZona(zona: Omit<Zona, "id" | "created_at" | "updated_at">) {
        try {
            const response = await authHttp.post("/api/zonas", zona);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al crear la zona"));
        }
    },

    async updateZona(id: number, zona: Omit<Zona, "id" | "created_at" | "updated_at">) {
        try {
            const response = await authHttp.put(`/api/zonas/${id}`, zona);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al actualizar la zona con ID ${id}`));
        }
    },

    async deleteZona(id: number) {
        try {
            await authHttp.delete(`/api/zonas/${id}`);
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al eliminar la zona con ID ${id}`));
        }
    },
};