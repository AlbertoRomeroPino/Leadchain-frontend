import { useEffect, useState } from "react";
import type { Cliente } from "../../../types/clientes/Cliente";
import { clientesService } from "../../../services/ClientesService";

interface EdificioModalEdificioProps {
  direccionCompleta: string;
  setDireccionCompleta: (direccion: string) => void;
  tipo: string;
  setTipo: (tipo: string) => void;
  idZona: number;
  setIdZona: (idZona: number) => void;
  planta: string;
  setPlanta: (planta: string) => void;
  puerta: string;
  setPuerta: (puerta: string) => void;
  idCliente: number | null;
  setIdCliente: (idCliente: number | null) => void;
  zonas: { id: number; nombre_zona: string }[];
}

const EdificioModalEdificio = ({
  direccionCompleta,
  setDireccionCompleta,
  tipo,
  setTipo,
  idZona,
  setIdZona,
  planta,
  setPlanta,
  puerta,
  setPuerta,
  idCliente,
  setIdCliente,
  zonas,
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
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Planta"
        value={planta}
        onChange={(event) => setPlanta(event.target.value)}
      />
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Puerta"
        value={puerta}
        onChange={(event) => setPuerta(event.target.value)}
      />
      <select
        className="form-edificio-input"
        value={idCliente ?? ""}
        onChange={(event) =>
          setIdCliente(event.target.value ? Number(event.target.value) : null)
        }
        required
      >
        <option value="">Seleccionar cliente</option>
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nombre} {cliente.apellidos}
          </option>
        ))}
      </select>
    </>
  );
};

export default EdificioModalEdificio;
