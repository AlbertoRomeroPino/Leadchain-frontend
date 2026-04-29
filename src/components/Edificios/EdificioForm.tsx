import React, { useState } from "react";
import "../../styles/components/Edificios/EdificioForm.css";
import type { EdificioInput, GeoPoint } from "../../types";

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
  const [idZona, setIdZona] = useState(initialValues?.id_zona ?? "");
  const [lat, setLat] = useState(initialValues?.ubicacion?.lat ?? 0);
  const [lng, setLng] = useState(initialValues?.ubicacion?.lng ?? 0);
  const [tipo, setTipo] = useState(initialValues?.tipo ?? "");

  const isEditMode = mode === "edit";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: EdificioInput = {
      direccion_completa: direccionCompleta.trim(),
      id_zona: Number(idZona),
      ubicacion: { lat: Number(lat), lng: Number(lng) } as GeoPoint,
      tipo: tipo.trim(),
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
          onChange={(edificio) => setDireccionCompleta(edificio.target.value)}
          required
        />
      </div>

      <div>
        <label>ID Zona</label>
        <input
          type="number"
          value={idZona}
          onChange={(edificio) => setIdZona(edificio.target.value)}
          required
        />
      </div>

      <div>
        <label>Latitud</label>
        <input
          type="number"
          value={lat}
          step="any"
          onChange={(edificio) => setLat(Number(edificio.target.value))}
          required
        />
      </div>

      <div>
        <label>Longitud</label>
        <input
          type="number"
          value={lng}
          step="any"
          onChange={(edificio) => setLng(Number(edificio.target.value))}
          required
        />
      </div>

      <div>
        <label>Tipo</label>
        <input
          value={tipo}
          onChange={(edificio) => setTipo(edificio.target.value)}
          required
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
