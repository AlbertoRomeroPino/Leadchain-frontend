import React, { useState } from "react";
import type { EdificioInput } from "../../types/edificios/Edificio";
import type { GeoPoint } from "../../types/shared/GeoPoint";

interface EdificioFormProps {
  onSubmit: (edificio: EdificioInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<EdificioInput>;
}

const EdificioForm = ({
  onSubmit,
  onCancel,
  loading,
  mode,
  initialValues,
}: EdificioFormProps) => {
  const [direccionCompleta, setDireccionCompleta] = useState(
    initialValues?.direccion_completa ?? "",
  );
  const [planta, setPlanta] = useState(initialValues?.planta ?? "");
  const [puerta, setPuerta] = useState(initialValues?.puerta ?? "");
  const [idZona, setIdZona] = useState(initialValues?.id_zona ?? "");
  const [lat, setLat] = useState(initialValues?.ubicacion?.lat ?? 0);
  const [lng, setLng] = useState(initialValues?.ubicacion?.lng ?? 0);
  const [tipo, setTipo] = useState(initialValues?.tipo ?? "");
  const [idCliente, setIdCliente] = useState(initialValues?.id_cliente ?? "");

  const isEditMode = mode === "edit";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: EdificioInput = {
      direccion_completa: direccionCompleta.trim(),
      planta: planta.trim() || undefined,
      puerta: puerta.trim() || undefined,
      id_zona: Number(idZona),
      ubicacion: { lat: Number(lat), lng: Number(lng) } as GeoPoint,
      tipo: tipo.trim(),
      id_cliente: idCliente ? Number(idCliente) : undefined,
    };

    if (
      !payload.direccion_completa ||
      !payload.tipo ||
      isNaN(payload.id_zona) ||
      isNaN(payload.ubicacion.lat) ||
      isNaN(payload.ubicacion.lng)
    ) {
      return;
    }

    await onSubmit(payload);
  };

  return (
    <form className="edificio-form" onSubmit={handleSubmit}>
      <div>
        <label>Dirección completa</label>
        <input
          value={direccionCompleta}
          onChange={(e) => setDireccionCompleta(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Planta</label>
        <input value={planta} onChange={(e) => setPlanta(e.target.value)} />
      </div>

      <div>
        <label>Puerta</label>
        <input value={puerta} onChange={(e) => setPuerta(e.target.value)} />
      </div>

      <div>
        <label>ID Zona</label>
        <input
          type="number"
          value={idZona}
          onChange={(e) => setIdZona(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Latitud</label>
        <input
          type="number"
          value={lat}
          step="any"
          onChange={(e) => setLat(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <label>Longitud</label>
        <input
          type="number"
          value={lng}
          step="any"
          onChange={(e) => setLng(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <label>Tipo</label>
        <input
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        />
      </div>

      <div>
        <label>ID Cliente</label>
        <input
          type="number"
          value={idCliente}
          onChange={(e) => setIdCliente(e.target.value)}
        />
      </div>

      <div>
        <button type="submit" disabled={loading}>
          {isEditMode ? "Actualizar" : "Crear"}
        </button>
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default EdificioForm;
