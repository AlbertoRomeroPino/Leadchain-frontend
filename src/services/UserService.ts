import { authHttp } from "./https";
import { wrapServiceCall } from "./ExceptionService";
import type { User, UserInput, UserUpdateInput, Zona } from "../types";

interface ComercialAMiCargoData {
  comerciales: User[];
  zonas: Zona[];
}

export const UserService = {
  async getCurrentUser(): Promise<User> {
    return wrapServiceCall(
      () => authHttp.get<User>("/api/users/me").then(r => r.data),
      "Error al obtener el usuario actual"
    );
  },

  async createUser(user: UserInput): Promise<User> {
    return wrapServiceCall(
      () => authHttp.post<User>("/api/users", user).then(r => r.data),
      "Error al crear el usuario"
    );
  },

  async updateUser(id: number, user: UserUpdateInput): Promise<User> {
    return wrapServiceCall(
      () => authHttp.put<User>(`/api/users/${id}`, user).then(r => r.data),
      `Error al actualizar el usuario con ID ${id}`
    );
  },

  async deleteUser(id: number): Promise<void> {
    return wrapServiceCall(
      () => authHttp.delete(`/api/users/${id}`).then(() => undefined),
      `Error al eliminar el usuario con ID ${id}`
    );
  },

  async patchUser(id: number, user: UserUpdateInput): Promise<User> {
    return wrapServiceCall(
      () => authHttp.patch<User>(`/api/users/${id}`, user).then(r => r.data),
      `Error al actualizar parcialmente el usuario con ID ${id}`
    );
  },

  async getComercialesAMiCargo(): Promise<ComercialAMiCargoData> {
    return wrapServiceCall(
      () => authHttp.get<ComercialAMiCargoData>("/api/users/comerciales-a-cargo").then(r => r.data),
      "Error al obtener comerciales a cargo"
    );
  },
};
