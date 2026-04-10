import { authHttp } from "./https";
import { ExceptionService } from "./ExceptionService";
import type { User, UserInput, UserUpdateInput } from "../types/users/User";
import type { Zona } from "../types/zonas/Zona";

interface ComercialAMiCargoData {
  comerciales: User[];
  zonas: Zona[];
}

export const UserService = {
  async getCurrentUser() {
    try {
      const response = await authHttp.get("/api/users/me");
      return response.data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          "Error al obtener el usuario actual",
        ),
      );
    }
  },

  async getUserById(id: number) {
    try {
      const response = await authHttp.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          `Error al obtener el usuario con ID ${id}`,
        ),
      );
    }
  },

  async createUser(user: UserInput) {
    try {
      const response = await authHttp.post("/api/users", user);
      return response.data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(error, "Error al crear el usuario"),
      );
    }
  },

  async updateUser(id: number, user: UserUpdateInput) {
    try {
      const response = await authHttp.put(`/api/users/${id}`, user);
      return response.data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          `Error al actualizar el usuario con ID ${id}`,
        ),
      );
    }
  },

  async deleteUser(id: number) {
    try {
      await authHttp.delete(`/api/users/${id}`);
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          `Error al eliminar el usuario con ID ${id}`,
        ),
      );
    }
  },

  async getUsers() {
    try {
      const response = await authHttp.get("/api/users");
      return response.data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(error, "Error al obtener los usuarios"),
      );
    }
  },

  async patchUser(id: number, user: UserUpdateInput) {
    try {
      const response = await authHttp.patch(`/api/users/${id}`, user);
      return response.data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          `Error al actualizar parcialmente el usuario con ID ${id}`,
        ),
      );
    }
  },

  /**
   * Obtener comerciales a cargo del usuario actual con visitas, clientes y zonas consolidados
   * Una sola petición retorna toda la información necesaria para ComercialesPage
   */
  async getComercialesAMiCargo(): Promise<ComercialAMiCargoData> {
    try {
      const { data } = await authHttp.get<ComercialAMiCargoData>(
        "/api/users/comerciales-a-cargo"
      );
      return data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(
          error,
          "Error al obtener comerciales a cargo"
        ),
      );
    }
  },
};
