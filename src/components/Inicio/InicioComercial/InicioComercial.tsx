import { useState, useEffect } from "react";
import { useAuth } from "../../../auth/useAuth";
import { InicioService } from "../../../services/InicioService";
import showStatusAlert from "../../../components/utils/StatusAlert";
import type { Cliente } from "../../../types/clientes/Cliente";
import type { Visita } from "../../../types/visitas/Visita";
import ClientesSinVisitar from "./ClientesSinVisitar/ClientesSinVisitar";

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
        showStatusAlert({
          type: "loading",
          title: "Cargando inicio...",
          description: "Obteniendo datos de clientes y visitas",
          duration: null,
        });

        setLoading(true);
        setError(null);

        // Una sola petición consolida todos los datos necesarios
        const inicioData = await InicioService.getComercialInicio();

        // Extraer clientes de los edificios
        const clientesZona = inicioData.clientes;

        // Crear mapa de visitas por cliente (última visita)
        const visitasPorCliente = new Map<number, Visita>();
        inicioData.visitas.forEach((v) => {
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
        showStatusAlert({
          type: "success",
          title: "Información cargada",
          duration: 2000,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        showStatusAlert({
          type: "error",
          title: "Error",
          duration: 4000,
        });
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
