import { authHttp } from "./https";
import { ExceptionService } from "./ExceptionService";
import type { User } from "../types";

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

  async createUser(user: Omit<User, "id">) {
    try {
      const response = await authHttp.post("/api/users", user);
      return response.data;
    } catch (error) {
      throw new Error(
        ExceptionService.getErrorMessage(error, "Error al crear el usuario"),
      );
    }
  },

  async updateUser(id: number, user: Omit<User, "id">) {
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

  async patchUser(id: number, user: Partial<User>) {
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
};
