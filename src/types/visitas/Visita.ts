export type Visita = {
  id: number;
  id_usuario: number;
  id_cliente: number;
  fecha_hora: string;
  id_estado: number;
  observaciones: string | null;
  usuario?: {
    id: number;
    nombre: string;
    apellidos: string;
  };
  estado?: {
    id: number;
    etiqueta: string;
    color_hex: string;
  };
  cliente?: {
    id: number;
    nombre: string;
    apellidos: string;
    telefono?: string | null;
    email?: string | null;
    edificios?: Array<{
      id: number;
      direccion_completa: string;
      planta?: string | null;
      puerta?: string | null;
      created_at: string;
      updated_at: string;
    }>;
  } | null;
  created_at: string;
  updated_at: string;
};

export type VisitaInput = {
  id_usuario: number;
  id_cliente: number;
  fecha_hora: string;
  id_estado: number;
  observaciones?: string | null;
};

export type VisitaUser = {
  id: number;
  id_usuario: number;
  id_cliente: number;
  fecha_hora: string;
  id_estado: number;
  observaciones: string | null;
  estado?: {
    id: number;
    etiqueta: string;
    color_hex: string;
  };
  created_at: string;
  updated_at: string;
};