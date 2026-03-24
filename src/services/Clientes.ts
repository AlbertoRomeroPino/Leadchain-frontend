import type { Cliente } from "../types/Cliente";


const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ?? "localhost:8000";

  export const clientesService = {
    async getClientes(): Promise<Cliente[]> {
      const response = await fetch(`${API_BASE_URL}/api/clientes`);
        if (!response.ok) {
            throw new Error(`Error al obtener clientes: ${response.statusText}`);
        }
        return response.json();
    },

    async getClienteById(id: number): Promise<Cliente> {
        const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`);
        if (!response.ok) {
            throw new Error(`Error al obtener cliente con ID ${id}: ${response.statusText}`);
        }
        return response.json();
    },

    async createCliente(cliente: Omit<Cliente, "id">): Promise<Cliente> {
        const response = await fetch(`${API_BASE_URL}/api/clientes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cliente),
        });
        if (!response.ok) {
            throw new Error(`Error al crear cliente: ${response.statusText}`);
        }   
        return response.json();
    }

};