import type { GeoPoint } from "./GeoPoint";

// Definición de edificio al obtener datos
export type Edificio = {
    id: number;
    direccion_completa: string;
    planta: string | null;
    puerta: string | null;
    ubicacion: GeoPoint | null;
    id_zona: number;
    tipo: string;
    id_cliente: number | null;
    created_at: string;
    updated_at: string;
};

// Definición para crear o actualizar edificio
export type EdificioInput = {
    direccion_completa: string;
    planta?: string | null;
    puerta?: string | null;
    ubicacion: GeoPoint;
    id_zona: number;
    tipo: string;
    id_cliente?: number | null;
}