import { ExceptionService } from "./ExceptionService";
import { authHttp } from "./https";

export const EstadoVisitaService = {
    async getEstadosVisita() {
        try {
            const response = await authHttp.get("/api/estados-visita");
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener los estados de visita"));
        }
    },

    async getEstadoVisitaById(id: number) {
        try {
            const response = await authHttp.get(`/api/estados-visita/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(ExceptionService.getErrorMessage(error, `Error al obtener el estado de visita con ID ${id}`));
        }
    },
};