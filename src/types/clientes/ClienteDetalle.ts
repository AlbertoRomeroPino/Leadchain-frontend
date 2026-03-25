import type { Cliente } from "./Cliente";
import type { Edificio } from "../edificios/Edificio";

export type ClienteDetalleVisita = {
  id: number;
  id_usuario: number;
  id_cliente: number;
  id_estado: number;
  fecha_hora: string;
  observaciones: string | null;
  usuario?: {
    id: number;
    nombre: string;
    apellidos: string;
  } | null;
  estado?: {
    id: number;
    etiqueta: string;
    color_hex: string;
  } | null;
};

export type ClienteDetalleResponse = {
  cliente: Pick<Cliente, "id" | "nombre" | "apellidos" | "telefono" | "email">;
  edificio: (Edificio & {
    zona?: {
      id: number;
      nombre_zona: string;
    } | null;
  }) | null;
  visitas: {
    total: number;
    ultima: ClienteDetalleVisita | null;
  };
};