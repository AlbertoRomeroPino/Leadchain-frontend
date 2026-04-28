import type { VisitaUser, Cliente } from "../";

// Definición de usuario devuelto por API (sin password)
export type User = {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  id_responsable: number | null;
  id_zona: number | null;
  created_at: string;
  updated_at: string;
};

// Definición para crear usuario (incluye password)
export type UserInput = {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rol: string;
  id_responsable?: number | null;
  id_zona?: number | null;
};

// Definición para actualizar usuario (todo opcional)
export type UserUpdateInput = {
  nombre?: string;
  apellidos?: string;
  email?: string;
  password?: string;
  rol?: string;
  id_responsable?: number | null;
  id_zona?: number | null;
};

// Tipo de usuario publico sin contraseña
export type PublicUser = Pick<
  User,
  "id" | "nombre" | "apellidos" | "email" | "rol" | "id_zona"
>;

// Tipo para la sesión de autenticación
export type AuthSession = {
  token: string;
  user: User;
};

// Tipo para las credenciales de inicio de sesión
export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = AuthSession;

export type RegisterData = {
  email: string;
  nombre: string;
  password: string;
};

export type UserVisitas = {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  id_responsable: number | null;
  id_zona: number | null;
  created_at: string;
  updated_at: string;
  visitas: (VisitaUser & { cliente: Cliente | null })[];
};