import type { GeoPoint } from './GeoPoint';

// Definición de zona al crear o actualizar
export type ZonaInput = {
    nombre_zona: string;
    esquina_noroeste: GeoPoint;
    esquina_noreste: GeoPoint;
    esquina_suroeste: GeoPoint;
    esquina_sureste: GeoPoint;
};

// Definición de zona al obtener datos
export type Zona = {
    id: number;
    nombre_zona: string;
    esquina_noroeste: GeoPoint | null;
    esquina_noreste: GeoPoint | null;
    esquina_suroeste: GeoPoint | null;
    esquina_sureste: GeoPoint | null;
    created_at: string;
    updated_at: string;
    usuarios?: Array<{
        id: number;
        nombre: string;
        apellidos: string;
        email: string;
        rol: string;
        id_zona: number | null;
    }>;
    edificios?: Array<{
        id: number;
        direccion_completa: string;
        planta: string | null;
        puerta: string | null;
        id_zona: number;
        tipo: string;
        id_cliente: number | null;
    }>;
};