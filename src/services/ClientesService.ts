import type { Cliente, ClienteDetalleResponse } from "../types";
import { authHttp } from "./https";
import { wrapServiceCall } from "./ExceptionService";

type ClientePayload = {
  nombre: string;
  apellidos: string;
  telefono?: string;
  email?: string;
  id_usuario_asignado: number | null;
};

export const ClientesService = {
  async getClientes(): Promise<Cliente[]> {
    return wrapServiceCall(
      () => authHttp.get<Cliente[]>("/api/clientes").then(r => r.data),
      "Error al obtener clientes"
    );
  },

  async getClienteById(id: number): Promise<Cliente> {
    return wrapServiceCall(
      () => authHttp.get<Cliente>(`/api/clientes/${id}`).then(r => r.data),
      `Error al obtener cliente con ID ${id}`
    );
  },

  async getClientesSinEdificio(): Promise<Cliente[]> {
    return wrapServiceCall(
      () => authHttp.get<Cliente[]>("/api/clientes/sin-edificio").then(r => r.data),
      "Error al obtener clientes sin edificio"
    );
  },

  async getClienteDetalle(id: number): Promise<ClienteDetalleResponse> {
    return wrapServiceCall(
      () => authHttp.get<ClienteDetalleResponse>(`/api/cliente/detalles/${id}`).then(r => r.data),
      `Error al obtener detalle del cliente con ID ${id}`
    );
  },

  async createCliente(cliente: ClientePayload): Promise<Cliente> {
    return wrapServiceCall(
      () => authHttp.post<Cliente>("/api/clientes", cliente).then(r => r.data),
      "Error al crear cliente"
    );
  },

  async updateCliente(id: number, cliente: ClientePayload): Promise<Cliente> {
    return wrapServiceCall(
      () => authHttp.put<Cliente>(`/api/clientes/${id}`, cliente).then(r => r.data),
      `Error al actualizar cliente con ID ${id}`
    );
  },

  async deleteCliente(id: number): Promise<void> {
    return wrapServiceCall(
      () => authHttp.delete(`/api/clientes/${id}`).then(() => undefined),
      `Error al eliminar cliente con ID ${id}`
    );
  },
};
