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
import { useInitialize } from "../../../hooks/useInitialize";

const ClientesComercialView = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const { user } = useAuth();

  const canCreateCliente = useMemo(() => false, []);

  const refreshClientes = useCallback(async () => {
    if (!user?.id) return;

    try {
      showLoadingAlert("Cargando clientes...");

      const clientesConEdificio = await ClientesService.getClientes();

      setClientes(clientesConEdificio);

      showSuccessAlert("Información cargada");
    } catch (err) {
      showErrorAlert(err, "Cargar Clientes");
    }
  }, [user?.id]);

  useInitialize(refreshClientes);

  const handleClienteUpdated = (clienteActualizado: Cliente) => {
    setClienteSeleccionado(clienteActualizado);
    setClientes((prev) =>
      prev.map((cliente) => (cliente.id === clienteActualizado.id ? clienteActualizado : cliente)),
    );
  };

  return (
    <>
      {clienteSeleccionado ? (
        <>
          <InfoCliente
            cliente={clienteSeleccionado}
            onClienteUpdated={handleClienteUpdated}
            onClienteDeleted={() => setClienteSeleccionado(null)}
            onBack={() => setClienteSeleccionado(null)}
          />
        </>
      ) : (
        <>
          <ClientesHeader
            canCreateCliente={canCreateCliente}
            onCreateClick={() => {}}
          />

          <ClientesConEdificioTable
            clientes={clientes}
            onSelectCliente={setClienteSeleccionado}
          />
        </>
      )}
    </>
  );
};

export default ClientesComercialView;