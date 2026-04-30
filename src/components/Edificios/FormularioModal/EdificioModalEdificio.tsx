import { useEffect, useState } from "react";
import type { Cliente } from "../../../types";
import { ClientesService } from "../../../services/ClientesService";

import '../../../styles/components/Edificios/FormularioModal/EdificioModalEdificio.css';

const MAX_CLIENTE_NOMBRE_LENGTH = 40;

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
};

const formatClienteNombre = (cliente: Cliente) => {
  const apellidos = cliente.apellidos?.trim() ?? "";
  const lowerApellidos = apellidos.toLowerCase();
  const nombreCompleto =
    !apellidos || lowerApellidos === "sin apellidos" || lowerApellidos === "sin apellido"
      ? cliente.nombre
      : `${cliente.nombre} ${apellidos}`;

  return truncateText(nombreCompleto, MAX_CLIENTE_NOMBRE_LENGTH);
};

interface EdificioModalEdificioProps {
  direccionCompleta: string;
  setDireccionCompleta: (direccion: string) => void;
  tipo: string;
  setTipo: (tipo: string) => void;
  idZona: number;
  setIdZona: (idZona: number) => void;
  idCliente: number | null;
  setIdCliente: (idCliente: number | null) => void;
  zonas: { id: number; nombre: string }[];
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
        const data = await ClientesService.getClientesSinEdificio();
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
        onChange={(event) => setDireccionCompleta(event.target.value.slice(0, 40))}
        maxLength={40}
        required
      />
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Tipo"
        value={tipo}
        onChange={(event) => setTipo(event.target.value.slice(0, 25))}
        maxLength={25}
        required
      />
      
      {/* Solo mostrar campos de Piso, Puerta y Cliente si ESTAMOS CREANDO (no editando) */}
      {!isEditing && (
        <>
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
                {formatClienteNombre(cliente)}
              </option>
            ))}
          </select>

          {/* Solo mostrar Planta y Puerta si hay cliente seleccionado */}
          {idCliente && (
            <div className="form-edificio-fields-group">
              <div className="form-edificio-fields-wrapper">
                <input
                  className="form-edificio-input"
                  type="text"
                  placeholder="Piso/Planta del cliente (opcional)"
                  value={clientePlanta}
                  onChange={(edificio) => setClientePlanta(edificio.target.value.slice(0, 20))}
                  maxLength={20}
                />
                <input
                  className="form-edificio-input"
                  type="text"
                  placeholder="Puerta del cliente (opcional)"
                  value={clientePuerta}
                  onChange={(edificio) => setClientePuerta(edificio.target.value.slice(0, 20))}
                  maxLength={20}
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
          )}
        </>
      )}

      <select
        className="form-edificio-input"
        value={idZona}
        onChange={(event) => setIdZona(Number(event.target.value))}
      >
        {zonas.map((zona) => (
          <option key={zona.id} value={zona.id}>
            {zona.nombre}
          </option>
        ))}
      </select>
    </>
  );
};

export default EdificioModalEdificio;
