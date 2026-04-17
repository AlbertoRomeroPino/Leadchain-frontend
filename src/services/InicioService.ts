import type { Zona } from "../types/zonas/Zona";
import type { Edificio } from "../types/edificios/Edificio";
import type { Cliente } from "../types/clientes/Cliente";
import type { Visita } from "../types/visitas/Visita";
import type { User } from "../types/users/User";
import { ExceptionService } from "./ExceptionService";
import { authHttp } from "./https";

export interface InicioComercialData {
  edificios: Edificio[];
  clientes: Cliente[];
  visitas: Visita[];
  estados_visita: Array<{ id: number; etiqueta: string; color_hex: string }>;
}

export interface InicioAdminData {
  usuarios_comerciales: User[];
  visitas: Visita[];
  clientes: Cliente[];
  edificios: Edificio[];
  estados_visita: Array<{ id: number; etiqueta: string; color_hex: string }>;
  zonas: Zona[];
}

export interface InicioMapaData {
  zonas: Zona[];
}

export interface DetalleEdificioData extends Edificio {
  zona?: Zona | null;
  clientes?: Array<Cliente & { planta?: string | null; puerta?: string | null }>;
}

export const InicioService = {
  /**
   * Obtener datos consolidados para inicio comercial
   * Una sola petición retorna: edificios, clientes, visitas y estados de visita
   */
  async getComercialInicio(): Promise<InicioComercialData> {
    try {
      const { data } = await authHttp.get<InicioComercialData>(
        "/api/inicio/comercial"
      );
      return data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          "Error al obtener datos del inicio comercial"
        )
      );
    }
  },

  /**
   * Obtener datos consolidados para inicio admin
   * Una sola petición retorna: usuarios, visitas, clientes, edificios y estados
   */
  async getAdminInicio(): Promise<InicioAdminData> {
    try {
      const { data } = await authHttp.get<InicioAdminData>(
        "/api/inicio/admin"
      );
      return data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          "Error al obtener datos del inicio admin"
        )
      );
    }
  },

  /**
   * Obtener datos consolidados para mapa
   * Una sola petición retorna: zonas y edificios
   */
  async getMapaInicio(): Promise<InicioMapaData> {
    try {
      const { data } = await authHttp.get<InicioMapaData>("/api/zonas/mapa");
      return data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          "Error al obtener datos del mapa"
        )
      );
    }
  },

  /**
   * Obtener detalle de un edificio con su zona y clientes
   * Una sola petición retorna: edificio, zona y clientes
   */
  async getDetalleEdificio(edificioId: number): Promise<DetalleEdificioData> {
    try {
      const { data } = await authHttp.get<DetalleEdificioData>(
        `/api/edificios/${edificioId}/detalle`
      );
      return data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          "Error al obtener detalle del edificio"
        )
      );
    }
  },
};
