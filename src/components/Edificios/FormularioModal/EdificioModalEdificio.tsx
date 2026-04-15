import { useEffect, useState } from "react";
import type { Cliente } from "../../../types/clientes/Cliente";
import { clientesService } from "../../../services/ClientesService";

import '../../../styles/components/Edificios/FormularioModal/EdificioModalEdificio.css';

interface EdificioModalEdificioProps {
  direccionCompleta: string;
  setDireccionCompleta: (direccion: string) => void;
  tipo: string;
  setTipo: (tipo: string) => void;
  idZona: number;
  setIdZona: (idZona: number) => void;
  idCliente: number | null;
  setIdCliente: (idCliente: number | null) => void;
  zonas: { id: number; nombre_zona: string }[];
  clientePlanta: string;
  setClientePlanta: (planta: string) => void;
  clientePuerta: string;
  setClientePuerta: (puerta: string) => void;
  isEditing?: boolean;
}

const EdificioModalEdificio = ({
  direccionCompleta,
  setDireccionCompleta,
  tipo,
  setTipo,
  idZona,
  setIdZona,
  idCliente,
  setIdCliente,
  zonas,
  clientePlanta,
  setClientePlanta,
  clientePuerta,
  setClientePuerta,
  isEditing = false,
}: EdificioModalEdificioProps) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    const fetchClientesSinEdificio = async () => {
      try {
        const data = await clientesService.getClientesSinEdificio();
        setClientes(data);
      } catch {
        setClientes([]);
      }
    };

    fetchClientesSinEdificio();
  }, []);

  const handleFillHouseFields = () => {
    setClientePlanta("Baja");
    setClientePuerta("S/N");
  };

  return (
    <>
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Dirección completa"
        value={direccionCompleta}
        onChange={(event) => setDireccionCompleta(event.target.value)}
        required
      />
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Tipo"
        value={tipo}
        onChange={(event) => setTipo(event.target.value)}
        required
      />
      <select
        className="form-edificio-input"
        value={idZona}
        onChange={(event) => setIdZona(Number(event.target.value))}
      >
        {zonas.map((zona) => (
          <option key={zona.id} value={zona.id}>
            {zona.nombre_zona}
          </option>
        ))}
      </select>
      
      {/* Solo mostrar campos de Piso, Puerta y Cliente si ESTAMOS CREANDO (no editando) */}
      {!isEditing && (
        <>
          {/* Contenedor para Planta y Puerta con botón de Casa */}
          <div className="form-edificio-fields-group">
            <div className="form-edificio-fields-wrapper">
              <input
                className="form-edificio-input"
                type="text"
                placeholder="Piso/Planta del cliente (opcional)"
                value={clientePlanta}
                onChange={(e) => setClientePlanta(e.target.value)}
              />
              <input
                className="form-edificio-input"
                type="text"
                placeholder="Puerta del cliente (opcional)"
                value={clientePuerta}
                onChange={(e) => setClientePuerta(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="form-edificio-house-btn"
              onClick={handleFillHouseFields}
              title="Rellenar para una casa (Baja, S/N)"
            >
              🏠 Casa
            </button>
          </div>
          <select
            className="form-edificio-input"
            value={idCliente ?? ""}
            onChange={(event) =>
              setIdCliente(event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">Seleccionar cliente (opcional)</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellidos}
              </option>
            ))}
          </select>
        </>
      )}
    </>
  );
};

export default EdificioModalEdificio;
