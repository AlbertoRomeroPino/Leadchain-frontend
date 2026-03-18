export type Visita = {
  id: number;
  id_usuario: number;
  id_cliente: number;
  fecha_hora: string;
  id_estado: number;
  observaciones: string | null;
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
