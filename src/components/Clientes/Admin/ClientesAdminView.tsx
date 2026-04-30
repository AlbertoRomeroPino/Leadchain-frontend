import type { Cliente } from "../../../types";
import { useCallback, useMemo, useState } from "react";
import { ClientesService } from "../../../services/ClientesService";
import { useAuth } from "../../../context/useAuth";
import {
  showErrorAlert,
  showSuccessAlert,
  showLoadingAlert,
} from "../../utils/errorHandler";
import InfoCliente from "../ClienteInfo";
import ClientesHeader from "../ClientesHeader";
import ClientesConEdificioTable from "../ClientesConEdificioTable";
import ClientesSinEdificioTable from "../ClientesSinEdificioTable";
import ClientesCreateModal from "../ClientesCreateModal";
import { useInitialize } from "../../../hooks/useInitialize";

const ClientesAdminView = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesSinEdificio, setClientesSinEdificio] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingCliente, setCreatingCliente] = useState(false);
  const { user } = useAuth();

  const canCreateCliente = useMemo(() => true, []);

  const refreshClientes = useCallback(async () => {
  if (!user?.id) return;

  try {
    showLoadingAlert("Cargando clientes...");

    // Obtenemos ambas listas en paralelo
    const [todosLosClientes, sinEdificio] = await Promise.all([
      ClientesService.getClientes(),
      ClientesService.getClientesSinEdificio(),
    ]);

    // Creamos un conjunto (Set) con las IDs de los que NO tienen edificio 
    // Esto hace que la búsqueda sea ultra rápida
    const idsSinEdificio = new Set(sinEdificio.map(c => c.id));

    // Filtramos la lista completa: 
    // "Solo deja pasar a los clientes cuya ID NO esté en el grupo de los sin edificio"
    const soloConEdificio = todosLosClientes.filter(cliente => !idsSinEdificio.has(cliente.id));

    // Actualizamos los estados
    setClientes(soloConEdificio);
    setClientesSinEdificio(sinEdificio);

    showSuccessAlert("Información cargada");
  } catch (err) {
    showErrorAlert(err, "Cargar Clientes");
  }
}, [user?.id]);

  useInitialize(refreshClientes);

  const handleCreateCliente = async (cliente: {
    nombre: string;
    apellidos: string;
    telefono?: string;
    email?: string;
  }) => {
    if (!canCreateCliente) {
      return;
    }

    try {
      setCreatingCliente(true);

      const nuevoCliente = await ClientesService.createCliente({
        nombre: cliente.nombre,
        apellidos: cliente.apellidos,
        ...(cliente.telefono ? { telefono: cliente.telefono } : {}),
        ...(cliente.email ? { email: cliente.email } : {}),
        id_usuario_asignado: null,
      });

      setClientesSinEdificio((prev) => {
        if (prev.some((item) => item.id === nuevoCliente.id)) {
          return prev;
        }
        return [...prev, nuevoCliente];
      });
      setShowCreateForm(false);
      showSuccessAlert("Cliente creado");
    } catch (err) {
      showErrorAlert(err, "Crear Cliente");
    } finally {
      setCreatingCliente(false);
    }
  };

  const handleClienteUpdated = (clienteActualizado: Cliente) => {
    setClienteSeleccionado(clienteActualizado);
    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === clienteActualizado.id ? clienteActualizado : cliente,
      ),
    );
  };

  const handleClienteDeleted = (clienteId: number) => {
    setClientes((prev) => prev.filter((item) => item.id !== clienteId));
    setClientesSinEdificio((prev) =>
      prev.filter((item) => item.id !== clienteId),
    );
    setClienteSeleccionado(null);
  };

  const { clientesConEdificio, clientesSinEdificioFiltrados } = useMemo(() => {
    const clientesConEdificio = clientes.filter(
      (cliente) => cliente.id_usuario_asignado !== null,
    );
    const clientesConEdificioIds = new Set(
      clientesConEdificio.map((cliente) => cliente.id),
    );
    const clientesSinEdificioFiltrados = clientesSinEdificio.filter(
      (cliente) => !clientesConEdificioIds.has(cliente.id),
    );
    return { clientesConEdificio, clientesSinEdificioFiltrados };
  }, [clientes, clientesSinEdificio]);

  return (
    <>
      {clienteSeleccionado ? (
        <>
          <InfoCliente
            cliente={clienteSeleccionado}
            onClienteUpdated={handleClienteUpdated}
            onClienteDeleted={handleClienteDeleted}
            onBack={() => setClienteSeleccionado(null)}
          />
        </>
      ) : (
        <>
          <ClientesHeader
            canCreateCliente={canCreateCliente}
            onCreateClick={() => setShowCreateForm(true)}
          />

          <ClientesConEdificioTable
            clientes={clientesConEdificio}
            onSelectCliente={setClienteSeleccionado}
          />

          <ClientesSinEdificioTable
            isAdmin={true}
            clientesSinEdificio={clientesSinEdificioFiltrados}
            onSelectCliente={setClienteSeleccionado}
          />

          {canCreateCliente && (
            <ClientesCreateModal
              show={showCreateForm}
              loading={creatingCliente}
              onClose={() => setShowCreateForm(false)}
              onSubmit={handleCreateCliente}
            />
          )}
        </>
      )}
    </>
  );
};

export default ClientesAdminView;
