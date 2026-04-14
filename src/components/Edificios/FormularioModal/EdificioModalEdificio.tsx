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
  idCliente: number | null;
  setIdCliente: (idCliente: number | null) => void;
  zonas: { id: number; nombre_zona: string }[];
  clientePlanta: string;
  setClientePlanta: (planta: string) => void;
  clientePuerta: string;
  setClientePuerta: (puerta: string) => void;
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
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Piso/Planta del cliente"
        value={clientePlanta}
        onChange={(e) => setClientePlanta(e.target.value)}
        required
      />
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Puerta del cliente"
        value={clientePuerta}
        onChange={(e) => setClientePuerta(e.target.value)}
        required
      />
    </>
  );
};

export default EdificioModalEdificio;
