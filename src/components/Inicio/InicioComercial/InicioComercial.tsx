import { useState, useEffect } from "react";
import { useAuth } from "../../../auth/useAuth";
import { clientesService } from "../../../services/ClientesService";
import { VisitasService } from "../../../services/VisitasService";
import { EdificiosService } from "../../../services/EdificiosService";
import type { Cliente } from "../../../types/clientes/Cliente";
import type { Visita } from "../../../types/visitas/Visita";
import ClientesSinVisitar from "./ClientesSinVisitar";

interface ClienteSinVisita {
  cliente: Cliente;
  tieneVisita: boolean;
  ultimaVisita?: Visita;
}

const InicioComercial = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<ClienteSinVisita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user || user.rol !== "comercial" || !user.id_zona) {
      setLoading(false);
      setError("Usuario no autorizado");
      return;
    }

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener edificios de la zona del comercial
        const edificiosData = await EdificiosService.getEdificios();
        const edificiosDelComercial = edificiosData.filter(
          (e) => e.id_zona === user.id_zona
        );

        // Obtener IDs únicos de clientes de esos edificios
        const idsClientesUnicos = new Set<number>();
        edificiosDelComercial.forEach((edificio) => {
          if (edificio.clientes && edificio.clientes.length > 0) {
            edificio.clientes.forEach((cliente) => {
              idsClientesUnicos.add(cliente.id);
            });
          }
        });

        // Obtener clientes y filtrar por los de la zona
        const clientesData = await clientesService.getClientes();
        const clientesZona = clientesData.filter((c) =>
          idsClientesUnicos.has(c.id)
        );

        // Obtener todas las visitas del comercial
        const visitasData = await VisitasService.getVisitas();
        const visitasComercial = visitasData.filter(
          (v) => v.id_usuario === user.id
        );

        // Crear mapa de visitas por cliente (última visita)
        const visitasPorCliente = new Map<number, Visita>();
        visitasComercial.forEach((v) => {
          if (!visitasPorCliente.has(v.id_cliente)) {
            visitasPorCliente.set(v.id_cliente, v);
          } else {
            const actual = visitasPorCliente.get(v.id_cliente)!;
            if (new Date(v.fecha_hora) > new Date(actual.fecha_hora)) {
              visitasPorCliente.set(v.id_cliente, v);
            }
          }
        });

        // Crear lista de clientes con info de visita
        const clientesConVisita: ClienteSinVisita[] = clientesZona.map((c) => ({
          cliente: c,
          tieneVisita: visitasPorCliente.has(c.id),
          ultimaVisita: visitasPorCliente.get(c.id),
        }));

        setClientes(clientesConVisita);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user, refreshTrigger]);

  const handleVisitaCreada = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!user || user.rol !== "comercial") {
    return null;
  }

  return (
    <div className="inicio-comercial">
      <ClientesSinVisitar
        clientes={clientes}
        loading={loading}
        onVisitaCreada={handleVisitaCreada}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default InicioComercial;
