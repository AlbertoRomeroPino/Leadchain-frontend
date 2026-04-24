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
};