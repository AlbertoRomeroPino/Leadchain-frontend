export type Cliente = {
    id: number;
    nombre: string;
    apellidos: string;
    telefono: string | null;
    email: string | null;
    id_usuario_asignado: number | null;
    created_at: string;
    updated_at: string;
};

export type ClienteInput = {
    nombre: string;
    apellidos: string;
    telefono?: string;
    email?: string;
}