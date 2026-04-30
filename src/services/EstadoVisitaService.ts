import { wrapServiceCall } from "./ExceptionService";
import { authHttp } from "./https";

export const EstadoVisitaService = {
  async getEstadosVisita() {
    return wrapServiceCall(
      () => authHttp.get("/api/estados-visita").then(r => r.data),
      "Error al obtener los estados de visita"
    );
  },
};
