import { authHttp } from "./https";
import { ExceptionService } from "./ExceptionService";
import type {EdificioInput } from "../types/edificios/Edificio";


export const EdificioService = {

    async getEdificios() {
        try {
            const response = await authHttp.get("/api/edificios");
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener edificios"));
        }
    },

    async getEdificioById(id: number) {
        try {
            const response = await authHttp.get(`/api/edificios/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al obtener edificio con ID ${id}`));
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

}