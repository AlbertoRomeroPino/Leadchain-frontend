import type { Cliente } from "../types/clientes/Cliente";
import type { ClienteDetalleResponse } from "../types/clientes/ClienteDetalle";
import { authHttp } from "./https";
import { ExceptionService } from "./ExceptionService";

type ClientePayload = {
  nombre: string;
  apellidos: string;
  telefono?: string;
  email?: string;
  id_usuario_asignado: number | null;
};


export const clientesService = {
  async getClientes(): Promise<Cliente[]> {
    try {
      const { data } = await authHttp.get<Cliente[]>("/api/clientes");
      return data;
    } catch (error) {
      throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener clientes"));
    }
  },

  async getClienteById(id: number): Promise<Cliente> {
    try {
      const { data } = await authHttp.get<Cliente>(`/api/clientes/${id}`);
      return data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(error, `Error al obtener cliente con ID ${id}`),
      );
    }
  },

  async getClientesSinEdificio(): Promise<Cliente[]> {
    try {
      const { data } = await authHttp.get<Cliente[]>("/api/clientes/sin-edificio");
      return data;
    } catch (error) {
      throw new Error(ExceptionService.getErrorMessage(error, "Error al obtener clientes sin edificio"));
    }
  },

  async getClienteDetalle(id: number): Promise<ClienteDetalleResponse> {
    try {
      const { data } = await authHttp.get<ClienteDetalleResponse>(`/api/clientes/${id}/detalle`);
      return data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(error, `Error al obtener detalle del cliente con ID ${id}`),
      );
    }
  },

  async createCliente(cliente: ClientePayload): Promise<Cliente> {
    try {
      const { data } = await authHttp.post<Cliente>("/api/clientes", cliente);
      return data;
    } catch (error) {
      throw new Error(ExceptionService.getErrorMessage(error, "Error al crear cliente"));
    }
  },

  async updateCliente(
    id: number,
    cliente: ClientePayload,
  ): Promise<Cliente> {
    try {
      const { data } = await authHttp.put<Cliente>(
        `/api/clientes/${id}`,
        cliente,
      );
      return data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(error, `Error al actualizar cliente con ID ${id}`),
      );
    }
  },

  async deleteCliente(id: number): Promise<void> {
    try {
      await authHttp.delete(`/api/clientes/${id}`);
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(error, `Error al eliminar cliente con ID ${id}`),
      );
    }
  },
};
