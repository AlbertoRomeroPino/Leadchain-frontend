import type { GeoPoint, Cliente} from "../";

// Definición de zona al crear o actualizar
export type ZonaInput = {
    nombre: string;
    area: GeoPoint[];
};

// Definición de zona al obtener datos
export type Zona = {
    id: number;
    nombre: string;
    area: GeoPoint[] | null;
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
        ubicacion: GeoPoint | null;
        id_zona: number;
        tipo: string;
        id_cliente: number | null;
        created_at: string;
        updated_at: string;
        clientes?: Cliente[];
        planta?: string | null;
        puerta?: string | null;
    }>;
};