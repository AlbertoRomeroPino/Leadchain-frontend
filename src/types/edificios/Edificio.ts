import type { GeoPoint } from "../shared/GeoPoint";
import type { Cliente } from "../clientes/Cliente";

// Definición de edificio al obtener datos
export type Edificio = {
    id: number;
    direccion_completa: string;
    ubicacion: GeoPoint | null;
    id_zona: number;
    tipo: string;
    id_cliente: number | null;
    // Cuando se obtiene a través de cliente, incluir datos pivot
    planta?: string | null;
    puerta?: string | null;
    cliente?: Cliente | null;
    clientes?:
      | Array<Cliente & { planta?: string | null; puerta?: string | null }>
      | { count: number };
    created_at: string;
    updated_at: string;
};

// Definición para crear o actualizar edificio
export type EdificioInput = {
    direccion_completa: string;
    ubicacion: GeoPoint;
    id_zona: number;
    tipo: string;
    id_cliente?: number | null;
}