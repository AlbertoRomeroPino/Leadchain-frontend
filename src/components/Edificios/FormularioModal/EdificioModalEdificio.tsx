import { useEffect, useState } from "react";
import type { Cliente } from "../../../types/clientes/Cliente";

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
    clientes: { id: number; nombre: string; apellidos: string }[];
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
  clientes
}: EdificioModalEdificioProps) => {
const [clientes, setClientes] = useState<Cliente[]>([]);
    useEffect(() => {
        (async () => {
                try {
                  const data = await clientesService.getClientesSinEdificio();
                  setClientes(data);
                } catch {
                  setClientes([]);
                }
              })();
  return (
    <>
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Dirección completa"
        value={direccionCompleta}
        onChange={(e) => setDireccionCompleta(e.target.value)}
        required
      />
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Tipo"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        required
      />
      <select
        className="form-edificio-input"
        value={idZona}
        onChange={(e) => setIdZona(Number(e.target.value))}
      >
        {zonas.map((z) => (
          <option key={z.id} value={z.id}>{z.nombre_zona}</option>
        ))}
      </select>
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Planta"
        value={planta}
        onChange={(e) => setPlanta(e.target.value)}
      />
      <input
        className="form-edificio-input"
        type="text"
        placeholder="Puerta"
        value={puerta}
        onChange={(e) => setPuerta(e.target.value)}
      />
      <select
        className="form-edificio-input"
        value={idCliente ?? ""}
        onChange={(e) => setIdCliente(e.target.value ? Number(e.target.value) : null)}
        required
      >
        <option value="">Seleccionar cliente</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre} {c.apellidos}</option>
        ))}
      </select>
    </>
  )
}

export default EdificioModalEdificio