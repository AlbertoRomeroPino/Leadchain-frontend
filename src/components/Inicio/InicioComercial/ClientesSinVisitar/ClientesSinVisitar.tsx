import { useState, useEffect } from "react";
import "../../../../styles/components/Inicio/InicioComercial/ClientesSinVisitar/ClientesSinVisitar.css";
import type { Cliente, Visita, Edificio, EstadoVisita} from "../../../../types";
import { useAuth } from "../../../../context/useAuth";
import { VisitasService } from "../../../../services/VisitasService";
import { EstadoVisitaService } from "../../../../services/EstadoVisitaService";
import { EdificiosService } from "../../../../services/EdificiosService";
import { useInitialize } from "../../../../hooks/useInitialize";
import { showLoadingAlert, showErrorAlert, showSuccessAlert } from "../../../../components/utils/errorHandler";
import VisitaFormularioModal from "../../../Visitas/FormularioModal/VisitaFormularioModal";
import type { VisitaFormValues } from "../../../Visitas/FormularioModal/VisitaFormularioModal";
import ClientesStats from "./ClientesStats";
import ClienteSinVisitaCard from "./ClienteSinVisitaCard";
import ClienteConVisitaCard from "./ClienteConVisitaCard";

export interface ClienteSinVisita {
  cliente: Cliente;
  tieneVisita: boolean;
  ultimaVisita?: Visita;
  edificio?: Edificio;
}

interface ClientesSinVisitarProps {
  clientes: ClienteSinVisita[];
  onVisitaCreada: () => void;
}

const ClientesSinVisitar = ({
  clientes: clientesData,
  onVisitaCreada,
}: ClientesSinVisitarProps) => {
  const { user } = useAuth();
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estados, setEstados] = useState<EstadoVisita[]>([]);
  const [clientes, setClientes] = useState<ClienteSinVisita[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useInitialize(
    async () => {
      try {
        const estadosData = await EstadoVisitaService.getEstadosVisita();
        setEstados(estadosData);

        const edificiosData: Edificio[] = await EdificiosService.getEdificios();

        const clientesConEdificio = clientesData.map((c) => {
          const edificio = edificiosData.find((edificio: Edificio) =>
            Array.isArray(edificio.clientes) &&
            edificio.clientes.some((cliente: Cliente) => cliente.id === c.cliente.id),
          );

          return {
            ...c,
            edificio,
          };
        });

        setClientes(clientesConEdificio);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setClientes(clientesData);
      }
    },
    [clientesData],
  );

  const clientesSinVisita = clientes.filter((c) => !c.tieneVisita);
  const clientesConVisita = clientes.filter((c) => c.tieneVisita);

  const handleCrearVisita = (clienteId: number) => {
    setClienteSeleccionado(clienteId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // NO resetear clienteSeleccionado aquí, esperar a que isSaving se vuelva false
  };

  const handleSubmitVisita = async (values: VisitaFormValues) => {
    try {
      setIsSaving(true);
      showLoadingAlert("Guardando visita...");
      await VisitasService.createVisita({
        ...values,
        id_usuario: user?.id ?? 0,
      });
      showSuccessAlert("Visita creada");
      handleCloseModal();
      onVisitaCreada();
      // No establecer isSaving a false aquí, esperar a que el cliente se mueva
    } catch (error) {
      showErrorAlert(error, "Crear Visita");
      console.error("Error al crear visita:", error);
      setIsSaving(false);
    }
  };

  // Esperar a que el cliente sea movido a Visitados antes de desbloquear botones
  useEffect(() => {
    if (!isSaving || !clienteSeleccionado) return;

    // Timeout de seguridad: desbloquear después de 5 segundos si algo salió mal
    const timeoutId = setTimeout(() => {
      const clienteAúnEnLista = clientesSinVisita.some(
        (c) => c.cliente.id === clienteSeleccionado,
      );

      // Si el cliente ya no está en la lista, se ha movido a "Visitados"
      if (!clienteAúnEnLista) {
        setIsSaving(false);
        setClienteSeleccionado(null);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [clientesSinVisita, isSaving, clienteSeleccionado]);

  const clienteSeleccionadoCompleto = clientes.find(
    (c) => c.cliente.id === clienteSeleccionado,
  )?.cliente ?? null;

  return (
    <div className="clientes-sin-visitar-container">
      <ClientesStats
        totalClientes={clientes.length}
        conVisita={clientesConVisita.length}
        sinVisita={clientesSinVisita.length}
      />

      <div className="clientes-section">
        <h2 className="clientes-section-title">Clientes por Visitar: {clientesSinVisita.length}</h2>

        {clientesSinVisita.length === 0 ? (
          <div className="clientes-empty">
            ¡Excelente! Todos tus clientes tienen visitas registradas.
          </div>
        ) : (
          <div className="clientes-grid">
            {clientesSinVisita.map((item) => (
              <ClienteSinVisitaCard
                key={item.cliente.id}
                item={item}
                onCrearVisita={handleCrearVisita}
                isLoading={isSaving}
              />
            ))}
          </div>
        )}
      </div>

      {clientesConVisita.length > 0 && (
        <div className="clientes-section">
          <h2 className="clientes-section-title">
            Clientes Visitadas: {clientesConVisita.length}
          </h2>
          <div className="clientes-grid">
            {clientesConVisita.map((item) => (
              <ClienteConVisitaCard key={item.cliente.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <VisitaFormularioModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitVisita}
        clientes={clientes.map((c) => c.cliente)}
        estados={estados}
        selectedClient={clienteSeleccionadoCompleto}
        mode="create"
      />
    </div>
  );
};

export default ClientesSinVisitar;
