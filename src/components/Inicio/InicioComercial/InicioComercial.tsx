import { useState, useCallback } from "react";
import "../../../styles/components/Inicio/InicioComercial/InicioComercial.css";
import { useAuth } from "../../../context/useAuth";
import { useInitialize } from "../../../hooks/useInitialize";
import { InicioService } from "../../../services/InicioService";
import {
  showLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../../components/utils/errorHandler";
import type { Cliente, Visita } from "../../../types";
import ClientesSinVisitar from "./ClientesSinVisitar/ClientesSinVisitar";

interface ClienteSinVisita {
  cliente: Cliente;
  tieneVisita: boolean;
  ultimaVisita?: Visita;
}

const InicioComercial = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<ClienteSinVisita[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Callback memoizado para cargar datos
  const loadComercialData = useCallback(async () => {
    if (!user || user.rol !== "comercial") {
      return;
    }

    try {
      showLoadingAlert("Cargando inicio...");

      // Una sola petición consolida todos los datos necesarios
      const inicioData = await InicioService.getComercialInicio();

      // Extraer clientes de los edificios
      const clientesZona = inicioData.clientes;

      // Crear mapa de visitas por cliente (última visita)
      const visitasPorCliente = new Map<number, Visita>();
      inicioData.visitas.forEach((visita) => {
        if (!visitasPorCliente.has(visita.id_cliente)) {
          visitasPorCliente.set(visita.id_cliente, visita);
        } else {
          const actual = visitasPorCliente.get(visita.id_cliente)!;
          if (new Date(visita.fecha_hora) > new Date(actual.fecha_hora)) {
            visitasPorCliente.set(visita.id_cliente, visita);
          }
        }
      });

      // Crear lista de clientes con info de visita
      const clientesConVisita: ClienteSinVisita[] = clientesZona.map(
        (cliente) => ({
          cliente: cliente,
          tieneVisita: visitasPorCliente.has(cliente.id),
          ultimaVisita: visitasPorCliente.get(cliente.id),
        }),
      );
      showSuccessAlert("Información cargada");
      setClientes(clientesConVisita);
    } catch (err) {
      showErrorAlert(err, "Cargar Datos");
      console.error("Error al cargar datos:", err);
    }
  }, [user]);

  // Ejecutar cuando user o refreshTrigger cambien
  useInitialize(loadComercialData, [user, refreshTrigger]);

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
        onVisitaCreada={handleVisitaCreada}
      />
    </div>
  );
};

export default InicioComercial;
