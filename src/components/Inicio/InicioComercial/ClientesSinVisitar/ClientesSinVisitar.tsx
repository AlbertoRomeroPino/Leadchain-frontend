import { useState } from "react";
import type { Cliente } from "../../../../types/clientes/Cliente";
import type { Visita } from "../../../../types/visitas/Visita";
import type { Edificio } from "../../../../types/edificios/Edificio";
import type { EstadoVisita } from "../../../../types/visitas/EstadoVisita";
import { useAuth } from "../../../../auth/useAuth";
import { VisitasService } from "../../../../services/VisitasService";
import { EstadoVisitaService } from "../../../../services/EstadoVisitaService";
import { EdificiosService } from "../../../../services/EdificiosService";
import { useInitialize } from "../../../../hooks/useInitialize";
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
  loading: boolean;
  onVisitaCreada: () => void;
}

const ClientesSinVisitar = ({
  clientes: clientesData,
  loading,
  onVisitaCreada,
}: ClientesSinVisitarProps) => {
  const { user } = useAuth();
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estados, setEstados] = useState<EstadoVisita[]>([]);
  const [clientes, setClientes] = useState<ClienteSinVisita[]>([]);

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
    setClienteSeleccionado(null);
    setIsModalOpen(false);
  };

  const handleSubmitVisita = async (values: VisitaFormValues) => {
    try {
      await VisitasService.createVisita({
        ...values,
        id_usuario: user?.id ?? 0,
      });
      handleCloseModal();
      onVisitaCreada();
    } catch (error) {
      console.error("Error al crear visita:", error);
      throw error;
    }
  };

  const clienteSeleccionadoCompleto = clientes.find(
    (c) => c.cliente.id === clienteSeleccionado,
  )?.cliente ?? null;

  if (loading) {
    return (
      <div className="clientes-sin-visitar-container">
        <div className="clientes-loading">Cargando clientes...</div>
      </div>
    );
  }

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
