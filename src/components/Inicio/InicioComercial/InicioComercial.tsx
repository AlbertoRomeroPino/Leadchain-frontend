import { useState, useEffect } from "react";
import "../../../styles/components/Inicio/InicioComercial/InicioComercial.css";
import { useAuth } from "../../../auth/useAuth";
import { InicioService } from "../../../services/InicioService";
import { showLoadingAlert, showErrorAlert, showSuccessAlert } from "../../../components/utils/errorHandler";
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

  useEffect(() => {
    if (!user || user.rol !== "comercial" || !user.id_zona) {
      return;
    }

    const cargarDatos = async () => {
      try {
        showLoadingAlert("Cargando inicio...");

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
        showSuccessAlert("Información cargada");
      } catch (err) {
        showErrorAlert(err, "Cargar Datos");
        console.error("Error al cargar datos:", err);
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
        onVisitaCreada={handleVisitaCreada}
      />
    </div>
  );
};

export default InicioComercial;
